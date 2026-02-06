import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Terminal } from '@phosphor-icons/react'

interface FloatingPoint {
  id: number
  x: number
  y: number
}

function App() {
  const [score, setScore] = useKV<number>('poop-score', 0)
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([])
  const [clickCount, setClickCount] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setScore((current) => (current ?? 0) + 1)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newPoint: FloatingPoint = {
      id: Date.now() + Math.random(),
      x,
      y
    }
    
    setFloatingPoints((current) => [...current, newPoint])
    setClickCount((prev) => prev + 1)
    
    setTimeout(() => {
      setFloatingPoints((current) => current.filter(p => p.id !== newPoint.id))
    }, 1000)
  }

  const formatScore = (num: number) => {
    return num.toLocaleString()
  }

  const getMilestone = (num: number) => {
    if (num >= 1000) return { text: '[ LEGENDARY POOPER ]', level: 'ULTRA' }
    if (num >= 500) return { text: '[ MASTER POOPER ]', level: 'HIGH' }
    if (num >= 100) return { text: '[ PRO POOPER ]', level: 'MED' }
    return null
  }

  const currentScore = score ?? 0
  const milestone = getMilestone(currentScore)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 scan-lines">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl space-y-6"
      >
        <Card className="terminal-window border-2 border-primary/40 bg-card/95 backdrop-blur-sm p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-primary/30 pb-4">
              <Terminal className="text-primary" size={24} weight="bold" />
              <div className="flex-1">
                <motion.h1 
                  className="text-xl md:text-2xl font-bold text-primary terminal-glow tracking-wider"
                  animate={{ opacity: [1, 0.8, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  POOP.exe v1.0.0
                </motion.h1>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
              </div>
            </div>

            <div className="space-y-4 font-mono">
              <div className="text-muted-foreground text-sm md:text-base">
                <span className="text-primary">root@poopOS</span>
                <span className="text-accent">:</span>
                <span className="text-accent">~</span>
                <span className="text-primary">$</span> cat /var/score/total
              </div>

              <motion.div
                key={currentScore}
                className="text-4xl md:text-6xl font-bold text-primary terminal-glow tabular-nums"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {formatScore(currentScore)}
              </motion.div>

              <div className="text-muted-foreground text-xs md:text-sm">
                <span className="text-primary">root@poopOS</span>
                <span className="text-accent">:</span>
                <span className="text-accent">~</span>
                <span className="text-primary">$</span> echo "POOP_POINTS™"
              </div>
            </div>

            {milestone && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Badge className="font-mono text-xs md:text-sm px-3 py-1 bg-accent/20 text-accent border border-accent/50 terminal-glow">
                  <Terminal className="mr-2" size={16} weight="bold" />
                  {milestone.text} STATUS: {milestone.level}
                </Badge>
              </motion.div>
            )}

            <div className="border border-primary/30 rounded p-6 md:p-8 bg-background/50 relative">
              <div className="text-muted-foreground text-xs md:text-sm mb-4 font-mono">
                &gt; EXECUTE: click_poop.sh
              </div>

              <div className="relative flex items-center justify-center">
                <motion.div
                  className="relative cursor-pointer select-none"
                  whileHover={{ 
                    scale: 1.05,
                    filter: 'drop-shadow(0 0 20px oklch(0.75 0.20 145 / 0.6))'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClick}
                >
                  <motion.div
                    className="text-[8rem] md:text-[12rem]"
                    animate={{
                      filter: [
                        'drop-shadow(0 0 10px oklch(0.75 0.20 145 / 0.3))',
                        'drop-shadow(0 0 20px oklch(0.75 0.20 145 / 0.5))',
                        'drop-shadow(0 0 10px oklch(0.75 0.20 145 / 0.3))'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    💩
                  </motion.div>

                  <AnimatePresence>
                    {floatingPoints.map((point) => (
                      <motion.div
                        key={point.id}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ 
                          opacity: 0, 
                          y: -60,
                          scale: 1.2
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute pointer-events-none text-xl md:text-2xl font-bold text-primary terminal-glow font-mono"
                        style={{
                          left: point.x,
                          top: point.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        +1
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="text-muted-foreground text-xs md:text-sm mt-4 font-mono text-center">
                &gt; CLICKS_REGISTERED: {clickCount} | STATUS: OPERATIONAL
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground font-mono border-t border-primary/20 pt-4"
            >
              <div className="flex items-center justify-between">
                <span>&gt; DATA_PERSISTENCE: ENABLED</span>
                <span className="text-primary terminal-glow">●</span>
              </div>
            </motion.div>
          </div>
        </Card>

        <div className="text-center text-muted-foreground text-xs font-mono">
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            █
          </motion.span>
          {" "}TERMINAL READY
        </div>
      </motion.div>
    </div>
  )
}

export default App