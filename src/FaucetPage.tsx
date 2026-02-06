import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import poopImg from './components/ui/poop.jpg'

// ============ Types ============
interface FaucetState {
  connected: boolean
  walletAddress: string | null
  canClaim: boolean
  cooldownRemaining: number
  isClaiming: boolean
  mockMode: boolean
}

// ============ Config ============
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : '/api'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(buffer: Uint8Array): string {
  if (buffer.length === 0) return ''
  const bytes = [...buffer]
  const digits = [0]
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i]
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8
      digits[j] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    result += ALPHABET[0]
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += ALPHABET[digits[i]]
  }
  return result
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Poop Image Component - using actual poop.jpg image
const PoopImage = ({ size = 'normal', className = '' }: { size?: 'small' | 'normal' | 'large' | 'xlarge', className?: string }) => {
  const sizeMap = {
    small: 'w-6 h-6',
    normal: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  }

  return (
    <img
      src={poopImg}
      alt="poop"
      className={`${sizeMap[size]} ${className}`}
      style={{ objectFit: 'contain' }}
      draggable={false}
    />
  )
}

// ============ Component ============
export default function FaucetPage() {
  const [state, setState] = useState<FaucetState>({
    connected: false,
    walletAddress: null,
    canClaim: false,
    cooldownRemaining: 0,
    isClaiming: false,
    mockMode: false,
  })
  const [stats, setStats] = useState({ totalClaims: 0, uniqueWallets: 0, balance: 0 })
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)
  const [flushing, setFlushing] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const [showOverflowMsg, setShowOverflowMsg] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [lidOpen, setLidOpen] = useState(false)
  const [handlePressed, setHandlePressed] = useState(false)
  const [respawn, setRespawn] = useState(false)

  const walletRef = useRef<any>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cooldownEnd = useRef<number>(0)

  // ---- Cooldown timer ----
  const startCooldown = useCallback((seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownEnd.current = Date.now() + seconds * 1000
    setState(s => ({ ...s, canClaim: false, cooldownRemaining: seconds }))
    cooldownRef.current = setInterval(() => {
      const rem = Math.max(0, Math.floor((cooldownEnd.current - Date.now()) / 1000))
      if (rem <= 0) {
        clearInterval(cooldownRef.current!)
        cooldownRef.current = null
        setState(s => ({ ...s, canClaim: true, cooldownRemaining: 0 }))
        setRespawn(true)
        showStatusMsg('Ready to flush again!', 'success')
      } else {
        setState(s => ({ ...s, cooldownRemaining: rem }))
      }
    }, 1000)
  }, [])

  // ---- Status banner ----
  const showStatusMsg = (message: string, type: 'success' | 'error' | 'warning') => {
    setStatus({ message, type })
    if (type === 'success') setTimeout(() => setStatus(null), 3000)
  }

  // ---- Fetch stats ----
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      const data = await res.json()
      setStats({ totalClaims: data.total_claims, uniqueWallets: data.unique_wallets, balance: stats.balance })
    } catch { /* ignore */ }
  }, [stats.balance])

  // ---- Check status ----
  const checkStatus = useCallback(async (pubkey?: string | null) => {
    try {
      const wallet = pubkey || state.walletAddress
      const url = wallet ? `${API_BASE}/status?wallet=${wallet}` : `${API_BASE}/status`
      const res = await fetch(url)
      const data = await res.json()

      setState(s => ({ ...s, mockMode: data.mock_mode ?? false }))
      setStats(prev => ({ ...prev, balance: data.faucet_balance ?? 0 }))

      if (!data.can_claim && data.cooldown_remaining > 0) {
        startCooldown(data.cooldown_remaining)
      } else if (wallet) {
        setState(s => ({ ...s, canClaim: true }))
      }
    } catch { /* ignore */ }
  }, [state.walletAddress, startCooldown])

  // ---- Connect wallet ----
  const connectWallet = async () => {
    try {
      let provider: any = null
      if ((window as any).solana?.isPhantom) {
        provider = (window as any).solana
      } else if ((window as any).solflare?.isSolflare) {
        provider = (window as any).solflare
      } else {
        showStatusMsg('Please install Phantom or Solflare wallet', 'error')
        return
      }
      const response = await provider.connect()
      const pubkey = response.publicKey.toString()
      walletRef.current = provider
      setState(s => ({ ...s, connected: true, walletAddress: pubkey }))
      setLidOpen(true)
      await checkStatus(pubkey)
      showStatusMsg('Wallet connected!', 'success')
    } catch {
      showStatusMsg('Failed to connect wallet', 'error')
    }
  }

  const disconnectWallet = () => {
    walletRef.current?.disconnect()
    walletRef.current = null
    setState(s => ({ ...s, connected: false, walletAddress: null, canClaim: false, cooldownRemaining: 0 }))
    setLidOpen(false)
    if (cooldownRef.current) { clearInterval(cooldownRef.current); cooldownRef.current = null }
  }

  // ---- Animations ----
  const playFlush = () => {
    setHandlePressed(true)
    setFlushing(true)
    setRespawn(false)
    setTimeout(() => {
      setHandlePressed(false)
      setFlushing(false)
    }, 1500)
  }

  const playOverflow = () => {
    setOverflowing(true)
    setShowOverflowMsg(true)
    setTimeout(() => {
      setOverflowing(false)
      setState(s => ({ ...s, canClaim: true }))
    }, 3500)
  }

  const doRespawn = () => {
    setFlushing(false)
    setRespawn(true)
  }

  // ---- Claim ----
  const claimTokens = async () => {
    if (!state.walletAddress || !walletRef.current) {
      showStatusMsg('Please connect your wallet first', 'error')
      return
    }
    try {
      setState(s => ({ ...s, isClaiming: true, canClaim: false }))

      // 1. Get challenge
      const chalRes = await fetch(`${API_BASE}/challenge?wallet=${state.walletAddress}`)
      if (!chalRes.ok) {
        const err = await chalRes.json()
        showStatusMsg(err.detail || 'Failed to get challenge', 'error')
        setState(s => ({ ...s, isClaiming: false, canClaim: true }))
        return
      }
      const { nonce, message } = await chalRes.json()

      // 2. Sign message
      let signature: string
      try {
        const encoded = new TextEncoder().encode(message)
        const signed = await walletRef.current.signMessage(encoded, 'utf8')
        signature = base58Encode(signed.signature)
      } catch {
        showStatusMsg('Please sign the message to claim', 'error')
        setState(s => ({ ...s, isClaiming: false, canClaim: true }))
        return
      }

      setShowOverflowMsg(false)
      playFlush()

      // 3. Claim
      const res = await fetch(`${API_BASE}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: state.walletAddress, signature, message, nonce, captcha_token: null }),
      })
      const data = await res.json()
      setState(s => ({ ...s, isClaiming: false }))

      if (data.success) {
        setTxSig(data.tx_signature || null)
        setShowSuccess(true)
        doRespawn()
        if (data.next_claim_at) {
          const remaining = Math.floor((new Date(data.next_claim_at).getTime() - Date.now()) / 1000)
          startCooldown(remaining)
        }
        loadStats()
      } else if (data.error === 'no_token_account' || data.error === 'wallet_too_new') {
        playOverflow()
        if (data.error === 'wallet_too_new') {
          showStatusMsg('Your wallet needs some transaction history on Solana before claiming', 'error')
        }
      } else if (data.error === 'cooldown') {
        showStatusMsg(`Please wait ${formatCountdown(data.cooldown_remaining)}`, 'warning')
        startCooldown(data.cooldown_remaining)
        doRespawn()
      } else {
        showStatusMsg(data.error || data.detail || 'Claim failed', 'error')
        doRespawn()
        setState(s => ({ ...s, canClaim: true }))
      }
    } catch {
      showStatusMsg('Network error. Please try again.', 'error')
      setState(s => ({ ...s, isClaiming: false, canClaim: true }))
      doRespawn()
    }
  }

  // ---- Init ----
  useEffect(() => {
    loadStats()
    checkStatus()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Render ----
  const shortAddr = state.walletAddress
    ? `${state.walletAddress.slice(0, 4)}...${state.walletAddress.slice(-4)}`
    : null

  return (
    <div className="faucet-root">
      <style>{faucetCSS}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="faucet-container"
      >
        <header className="faucet-header">
          <div className="flex items-center justify-center gap-4 mb-2">
            <PoopImage size="large" />
            <h1 className="faucet-title">POOP FAUCET</h1>
            <PoopImage size="large" />
          </div>
          <p className="faucet-subtitle">Get 1 free $POOP token every hour!</p>
        </header>

        {/* Status Banner */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`faucet-status-banner faucet-status-${status.type}`}
          >
            {status.message}
          </motion.div>
        )}

        {/* Mock Warning */}
        {state.mockMode && (
          <div className="faucet-mock-warning">🧪 TEST MODE - No real tokens transferred</div>
        )}

        {/* Toilet */}
        <div className="faucet-toilet-container">
          <div className={`faucet-toilet ${overflowing ? 'overflowing' : ''}`}>
            <div className={`faucet-toilet-lid ${lidOpen ? 'open' : ''}`} />
            <div className="faucet-toilet-bowl">
              <div className={`faucet-water ${flushing ? 'flushing' : ''} ${overflowing ? 'overflow-water' : ''}`} />
              <div className={`faucet-poop ${flushing ? 'flushing' : ''} ${respawn ? 'respawn' : ''} ${overflowing ? 'overflow-poop' : ''}`}>
                <PoopImage size="normal" />
              </div>
            </div>
            <div className="faucet-toilet-base" />
            <div className="faucet-toilet-tank" />
            <div className={`faucet-flush-handle ${handlePressed ? 'pressed' : ''}`} onClick={() => { if (state.canClaim) claimTokens() }} />
            {overflowing && (
              <div className="faucet-overflow-splashes">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="faucet-splash">
                    <PoopImage size="small" />
                  </span>
                ))}
              </div>
            )}
            {overflowing && (
              <div className="faucet-overflow-drips">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="faucet-drip" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overflow Message */}
        {showOverflowMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="faucet-overflow-message"
          >
            You need at least 1 $POOP in your wallet to use the faucet! Buy some $POOP first, then come back for free refills.
          </motion.div>
        )}

        {/* Wallet Section */}
        <div className="faucet-wallet-section">
          <div className="faucet-wallet-status">
            <span className={`faucet-dot ${state.connected ? 'connected' : 'disconnected'}`} />
            <span>{shortAddr || 'Not Connected'}</span>
          </div>

          {!state.connected ? (
            <button className="faucet-btn faucet-btn-connect" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <button className="faucet-btn faucet-btn-disconnect" onClick={disconnectWallet}>
              Disconnect
            </button>
          )}
        </div>

        {/* Flush Button */}
        <div className="faucet-claim-section">
          <button
            className={`faucet-btn faucet-btn-flush ${state.isClaiming ? 'loading' : ''}`}
            disabled={!state.canClaim || state.isClaiming}
            onClick={claimTokens}
          >
            <span className="faucet-btn-icon">🚽</span>
            <span>FLUSH!</span>
          </button>

          {state.cooldownRemaining > 0 && (
            <div className="faucet-cooldown">
              Next flush in: <span className="faucet-cooldown-timer">{formatCountdown(state.cooldownRemaining)}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="faucet-stats">
          <div className="faucet-stat">
            <span className="faucet-stat-label">Total Flushes</span>
            <span className="faucet-stat-value">{stats.totalClaims.toLocaleString()}</span>
          </div>
          <div className="faucet-stat">
            <span className="faucet-stat-label">Unique Wallets</span>
            <span className="faucet-stat-value">{stats.uniqueWallets.toLocaleString()}</span>
          </div>
          <div className="faucet-stat">
            <span className="faucet-stat-label">Faucet Balance</span>
            <span className="faucet-stat-value">{stats.balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="faucet-instructions">
          <h3>How to get your POOP:</h3>
          <ol>
            <li>Connect your Phantom or Solflare wallet</li>
            <li>Click the FLUSH button</li>
            <li>Sign the message to prove wallet ownership</li>
            <li>Receive 1 $POOP token!</li>
            <li>Come back in 1 hour for more</li>
          </ol>
        </div>

        <footer className="faucet-footer">
          <div className="flex items-center justify-center gap-2">
            <span>Made with</span>
            <PoopImage size="small" />
            <span>| Not financial advice</span>
          </div>
        </footer>
      </motion.div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="faucet-modal" onClick={(e) => { if (e.target === e.currentTarget) setShowSuccess(false) }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="faucet-modal-content"
          >
            <div className="faucet-success-poop">
              <PoopImage size="xlarge" />
            </div>
            <h2>FLUSH SUCCESSFUL!</h2>
            <p>You received <strong>1 $POOP</strong></p>
            {txSig ? (
              <p className="faucet-tx-link">
                <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer">
                  View Transaction
                </a>
              </p>
            ) : (
              <p className="faucet-tx-link">(Test mode - no transaction)</p>
            )}
            <button className="faucet-btn faucet-btn-close" onClick={() => setShowSuccess(false)}>
              Nice!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ============ Scoped CSS ============
const faucetCSS = `
  .faucet-root {
    min-height: 100vh;
    background: #000000;
    color: #fff;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow-x: hidden;
    position: relative;
  }

  .faucet-container {
    position: relative; z-index: 1;
    max-width: 500px; margin: 0 auto; padding: 20px; text-align: center;
  }

  .faucet-header { margin-bottom: 20px; }

  .faucet-title {
    font-size: 2.5rem;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    animation: faucet-bounce 2s ease-in-out infinite;
  }

  @keyframes faucet-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .faucet-subtitle { color: #888; margin-top: 10px; }

  /* Status */
  .faucet-status-banner {
    padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; font-weight: 600;
  }
  .faucet-status-success { background: rgba(74,222,128,0.2); border: 1px solid #4ade80; color: #4ade80; }
  .faucet-status-error   { background: rgba(248,113,113,0.2); border: 1px solid #f87171; color: #f87171; }
  .faucet-status-warning { background: rgba(251,191,36,0.2); border: 1px solid #fbbf24; color: #fbbf24; }

  .faucet-mock-warning {
    background: rgba(251,191,36,0.2); border: 1px solid #fbbf24; color: #fbbf24;
    padding: 8px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem;
  }

  /* Toilet */
  .faucet-toilet-container { display: flex; justify-content: center; margin: 30px 0; }

  .faucet-toilet { position: relative; width: 180px; height: 220px; }

  .faucet-toilet-tank {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 80px; background: #333;
    border-radius: 10px 10px 0 0; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.3);
    border: 1px solid #555;
  }

  .faucet-toilet-lid {
    position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
    width: 140px; height: 20px; background: #333;
    border-radius: 50% 50% 0 0; box-shadow: 0 -3px 10px rgba(0,0,0,0.3);
    transform-origin: bottom center; transition: transform 0.5s ease; z-index: 3;
    border: 1px solid #555;
  }
  .faucet-toilet-lid.open { transform: translateX(-50%) rotateX(-120deg); }

  .faucet-toilet-bowl {
    position: absolute; top: 85px; left: 50%; transform: translateX(-50%);
    width: 140px; height: 100px; background: #333;
    border-radius: 50% 50% 40% 40%; overflow: hidden;
    box-shadow: inset 0 10px 20px rgba(0,0,0,0.5);
    border: 1px solid #555;
  }

  .faucet-water {
    position: absolute; bottom: 10px; left: 10%; width: 80%; height: 50px;
    background: #1a4d6d; border-radius: 50%; opacity: 0.7; transition: all 0.5s ease;
  }
  .faucet-water.flushing { animation: faucet-flush-water 1.5s ease-in-out; }
  @keyframes faucet-flush-water {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(360deg) scale(0.5); }
    100% { transform: rotate(720deg) scale(1); }
  }
  .faucet-water.overflow-water {
    animation: faucet-overflow-water 3s ease-in-out;
  }
  @keyframes faucet-overflow-water {
    0% { height: 50px; background: #1a4d6d; }
    15% { height: 70px; background: #2a3d2d; }
    30% { height: 95px; background: #3d3014; }
    50% { height: 110px; background: #332610; }
    70% { height: 105px; background: #2d1f0e; }
    85% { height: 80px; background: #2a3d2d; }
    100% { height: 50px; background: #1a4d6d; }
  }

  .faucet-poop {
    position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
    transition: all 0.5s ease; z-index: 2;
  }
  .faucet-poop.flushing { animation: faucet-poop-flush 1.5s ease-in-out forwards; }
  @keyframes faucet-poop-flush {
    0% { transform: translateX(-50%) rotate(0deg) scale(1); opacity: 1; }
    50% { transform: translateX(-50%) rotate(360deg) scale(0.5); opacity: 0.5; }
    100% { transform: translateX(-50%) rotate(720deg) scale(0) translateY(50px); opacity: 0; }
  }
  .faucet-poop.respawn { animation: faucet-poop-respawn 0.5s ease-out forwards; }
  @keyframes faucet-poop-respawn {
    0% { transform: translateX(-50%) scale(0); opacity: 0; }
    50% { transform: translateX(-50%) scale(1.2); opacity: 0.8; }
    100% { transform: translateX(-50%) scale(1); opacity: 1; }
  }
  .faucet-poop.overflow-poop {
    animation: faucet-poop-multiply 3s ease-in-out;
  }
  @keyframes faucet-poop-multiply {
    0% { transform: translateX(-50%) scale(1); }
    30% { transform: translateX(-50%) scale(1.8) rotate(15deg); }
    50% { transform: translateX(-50%) scale(2.2) rotate(-10deg); }
    70% { transform: translateX(-50%) scale(1.6) rotate(5deg); }
    100% { transform: translateX(-50%) scale(1); }
  }

  .faucet-toilet.overflowing { animation: faucet-toilet-rumble 0.15s ease-in-out 20; }
  @keyframes faucet-toilet-rumble {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-4px) rotate(-1deg); }
    75% { transform: translateX(4px) rotate(1deg); }
  }

  .faucet-toilet-base {
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 120px; height: 30px; background: #333;
    border-radius: 0 0 20px 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    border: 1px solid #555;
  }

  .faucet-flush-handle {
    position: absolute; top: 30px; right: 20px;
    width: 30px; height: 10px; background: #666;
    border-radius: 5px; cursor: pointer; transition: transform 0.3s ease;
    border: 1px solid #888;
  }
  .faucet-flush-handle:hover { transform: rotate(-30deg); }
  .faucet-flush-handle.pressed { transform: rotate(-45deg); }

  .faucet-overflow-splashes {
    position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
    width: 240px; height: 80px; pointer-events: none; z-index: 4;
  }
  .faucet-splash {
    position: absolute; opacity: 0;
    animation: faucet-splash-out 2.5s ease-out forwards;
  }
  .faucet-splash:nth-child(1) { left: 5%; animation-delay: 0.2s; }
  .faucet-splash:nth-child(2) { left: 35%; animation-delay: 0.35s; }
  .faucet-splash:nth-child(3) { left: 75%; animation-delay: 0.5s; }
  .faucet-splash:nth-child(4) { left: 20%; animation-delay: 0.7s; }
  .faucet-splash:nth-child(5) { left: 55%; animation-delay: 0.85s; }
  .faucet-splash:nth-child(6) { left: 90%; animation-delay: 0.4s; }
  .faucet-splash:nth-child(7) { left: -5%; animation-delay: 0.6s; }
  .faucet-splash:nth-child(8) { left: 45%; animation-delay: 1.0s; }
  .faucet-splash:nth-child(9) { left: 10%; animation-delay: 1.2s; }
  .faucet-splash:nth-child(10) { left: 65%; animation-delay: 1.4s; }
  .faucet-splash:nth-child(11) { left: 30%; animation-delay: 1.6s; }
  .faucet-splash:nth-child(12) { left: 80%; animation-delay: 1.8s; }
  @keyframes faucet-splash-out {
    0% { transform: translateY(0) scale(0.3) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    50% { opacity: 1; }
    100% { transform: translateY(-150px) scale(1.4) rotate(360deg); opacity: 0; }
  }

  .faucet-overflow-drips {
    position: absolute; top: 85px; left: 50%; transform: translateX(-50%);
    width: 160px; height: 140px; pointer-events: none; z-index: 5;
  }
  .faucet-drip {
    position: absolute; width: 8px; height: 0;
    background: #5a4a14; border-radius: 0 0 4px 4px; opacity: 0;
    animation: faucet-drip-down 2.5s ease-in forwards;
  }
  .faucet-drip:nth-child(1) { left: 5%; animation-delay: 0.5s; }
  .faucet-drip:nth-child(2) { left: 25%; animation-delay: 0.8s; width: 6px; }
  .faucet-drip:nth-child(3) { right: 25%; animation-delay: 0.6s; width: 10px; }
  .faucet-drip:nth-child(4) { right: 5%; animation-delay: 1.0s; }
  .faucet-drip:nth-child(5) { left: 45%; animation-delay: 0.9s; width: 7px; }
  @keyframes faucet-drip-down {
    0% { height: 0; opacity: 0; top: 0; }
    15% { height: 15px; opacity: 0.8; }
    60% { height: 50px; opacity: 0.9; top: 40px; }
    100% { height: 20px; opacity: 0; top: 120px; }
  }

  .faucet-overflow-message {
    margin-top: 15px; padding: 12px 20px;
    background: rgba(90,74,20,0.3); border: 1px solid #8a6a1e;
    border-radius: 12px; color: #d2a01e; font-weight: 600; font-size: 0.95rem;
  }

  /* Wallet */
  .faucet-wallet-section { margin: 20px 0; }

  .faucet-wallet-status {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: rgba(255,255,255,0.05);
    border-radius: 20px; margin-bottom: 15px; font-size: 0.9rem;
    border: 1px solid #333;
  }

  .faucet-dot { width: 8px; height: 8px; border-radius: 50%; }
  .faucet-dot.connected { background: #4ade80; box-shadow: 0 0 10px #4ade80; }
  .faucet-dot.disconnected { background: #f87171; }

  /* Buttons */
  .faucet-btn {
    padding: 12px 24px; border: none; border-radius: 12px;
    font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
    color: white;
  }
  .faucet-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .faucet-btn-connect {
    background: linear-gradient(135deg, #9945FF, #14F195);
  }
  .faucet-btn-connect:hover:not(:disabled) {
    transform: scale(1.05); box-shadow: 0 0 20px rgba(153,69,255,0.5);
  }

  .faucet-btn-disconnect {
    background: rgba(255,255,255,0.05); color: #888; font-size: 0.85rem; padding: 8px 16px;
    border: 1px solid #333;
  }
  .faucet-btn-disconnect:hover { background: rgba(255,255,255,0.1); }

  .faucet-claim-section { margin: 30px 0; }

  .faucet-btn-flush {
    background: linear-gradient(135deg, #5a4a14, #8a6a1e);
    font-size: 1.5rem; padding: 20px 50px; border-radius: 20px;
    display: inline-flex; align-items: center; gap: 10px;
    box-shadow: 0 10px 30px rgba(90,74,20,0.4);
  }
  .faucet-btn-flush:hover:not(:disabled) {
    transform: scale(1.1); box-shadow: 0 15px 40px rgba(90,74,20,0.6);
  }
  .faucet-btn-flush:active:not(:disabled) { transform: scale(0.95); }
  .faucet-btn-flush .faucet-btn-icon { font-size: 2rem; }
  .faucet-btn-flush.loading {
    animation: faucet-shake 0.5s ease-in-out infinite;
  }
  @keyframes faucet-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .faucet-cooldown { margin-top: 15px; color: #888; font-size: 1.1rem; }
  .faucet-cooldown-timer { font-family: 'Courier New', monospace; font-weight: bold; color: #fbbf24; }

  /* Stats */
  .faucet-stats {
    display: flex; justify-content: center; gap: 30px; margin: 30px 0; flex-wrap: wrap;
  }
  .faucet-stat {
    background: rgba(255,255,255,0.05); padding: 15px 25px; border-radius: 12px; min-width: 120px;
    border: 1px solid #333;
  }
  .faucet-stat-label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 5px; }
  .faucet-stat-value { font-size: 1.5rem; font-weight: bold; color: #d2a01e; }

  /* Instructions */
  .faucet-instructions {
    background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;
    text-align: left; margin: 30px 0; border: 1px solid #333;
  }
  .faucet-instructions h3 { margin-bottom: 15px; color: #d2a01e; }
  .faucet-instructions ol { margin-left: 20px; }
  .faucet-instructions li { margin: 8px 0; color: #888; }

  .faucet-footer { margin-top: 30px; color: #888; font-size: 0.85rem; }

  /* Modal */
  .faucet-modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex; align-items: center;
    justify-content: center; z-index: 1000;
  }
  .faucet-modal-content {
    background: #1a1a1a; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px;
    border: 1px solid #333;
  }
  .faucet-success-poop {
    animation: faucet-success-bounce 0.5s ease infinite alternate;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  @keyframes faucet-success-bounce {
    0% { transform: translateY(0) rotate(-10deg); }
    100% { transform: translateY(-20px) rotate(10deg); }
  }
  .faucet-modal-content h2 { color: #4ade80; margin: 20px 0; }
  .faucet-tx-link { font-size: 0.85rem; color: #888; margin: 15px 0; word-break: break-all; }
  .faucet-tx-link a { color: #d2a01e; }
  .faucet-btn-close { background: #4ade80; color: #000; margin-top: 20px; }

  @media (max-width: 480px) {
    .faucet-title { font-size: 1.8rem; }
    .faucet-toilet { transform: scale(0.8); }
    .faucet-btn-flush { font-size: 1.2rem; padding: 15px 35px; }
    .faucet-stats { gap: 15px; }
    .faucet-stat { min-width: 90px; padding: 10px 15px; }
  }
`
