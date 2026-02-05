import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from '@phosphor-icons/react'

interface FloatingPoint {
  id: number
  x: number
  y: number
}

function App() {
  const [score, setScore] = useKV<number>('poop-score', 0)
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([])
  const [clickId, setClickId] = useState(0)
  const [isPressed, setIsPressed] = useState(false)

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
    setClickId((prev) => prev + 1)
    
    setTimeout(() => {
      setFloatingPoints((current) => current.filter(p => p.id !== newPoint.id))
    }, 1000)
  }

  const formatScore = (num: number) => {
    return num.toLocaleString()
  }

  const getMilestone = (num: number) => {
    if (num >= 1000) return { text: 'Legendary Pooper!', icon: true }
    if (num >= 500) return { text: 'Master Pooper!', icon: true }
    if (num >= 100) return { text: 'Pro Pooper!', icon: true }
    return null
  }

  const currentScore = score ?? 0
  const milestone = getMilestone(currentScore)

  return (
    <div className="min-h-screen background-pattern flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-2xl w-full"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-accent tracking-tight">
            Proof of Operational Poop
          </h1>
          <p className="text-lg md:text-xl text-foreground/80">
            Click the poop to earn Poop Points™
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-accent/20">
          <div className="space-y-2">
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider">
              Total Poop Points
            </p>
            <motion.div
              key={currentScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="score-display text-5xl md:text-7xl font-bold text-accent"
            >
              {formatScore(currentScore)}
            </motion.div>
          </div>
        </Card>

        {milestone && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Badge className="text-base md:text-lg px-4 py-2 bg-accent text-accent-foreground gap-2">
              {milestone.icon && <Trophy weight="fill" className="w-5 h-5" />}
              {milestone.text}
            </Badge>
          </motion.div>
        )}

        <div className="relative flex items-center justify-center py-8">
          <motion.div
            className="relative cursor-pointer select-none w-40 h-40 md:w-56 md:h-56"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 5 }}
            animate={isPressed ? { scale: 0.95, rotate: 5 } : {}}
            onClick={handleClick}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            onPointerLeave={() => setIsPressed(false)}
          >
            <motion.div
              className="w-full h-full flex items-center justify-center text-[10rem] md:text-[14rem] drop-shadow-2xl"
              animate={{
                y: [0, -10, 0],
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
                  animate={{ opacity: 0, y: -80, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute pointer-events-none text-2xl md:text-3xl font-bold text-accent"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          Your progress is automatically saved
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App