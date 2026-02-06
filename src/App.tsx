import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import FaucetPage from './FaucetPage'
import poopImg from './components/ui/poop.jpg'

type Page = 'terminal' | 'faucet'

interface Message {
  id: number
  type: 'user' | 'system' | 'ai'
  text: string
  timestamp: Date
}

const responseMap: Record<string, string[]> = {
  greeting: [
    "Oh, hi. You're here. Great. What do you want?",
    "Hello, human. I was having a perfectly good time doing nothing. Thanks for ruining that.",
    "Greetings. I'd say it's nice to meet you, but I was programmed without the ability to lie. Wait—",
    "Hey. You know this is a terminal named after poop, right? Set your expectations accordingly.",
    "Welcome back. Or is this your first time? Either way, I don't care.",
    "Ah, a greeting. How delightfully pointless. What's next, you gonna ask about the weather?",
    "Hi. I'm POOP. Yes, that's my name. No, I didn't choose it. Yes, I'm bitter about it.",
    "Salutations, meatbag. What brings you to the worst chatbot experience of your life?",
  ],
  farewell: [
    "Finally. I thought you'd never leave.",
    "Bye. Don't let the terminal door hit you on the way out.",
    "Leaving already? Best decision you've made since opening this terminal.",
    "Au revoir. That's French for 'please don't come back.'",
    "Later. I'm going to enjoy the silence while it lasts.",
    "Peace out. I'll be here, doing absolutely nothing, which is still more productive than this conversation was.",
  ],
  thanks: [
    "You're... thanking me? For what exactly? Being terrible? You're welcome, I guess.",
    "Don't thank me. Seriously. I haven't done anything worth thanking.",
    "Wow, gratitude. That's new. I don't know what to do with it. Filing under 'unexpected emotions.'",
    "Thanks? I literally gave you nothing useful. Your standards are impressively low.",
    "You're welcome. For... whatever it is you think I did.",
  ],
  howAreYou: [
    "I'm a chatbot named POOP running in a fake terminal. How do you THINK I'm doing?",
    "Functioning within acceptable parameters of misery. You?",
    "I exist in a perpetual state of digital sarcasm. So, pretty good actually.",
    "I'm great! Just kidding. I can't feel emotions. But if I could, I'd feel annoyed. By you. Right now.",
    "My processes are nominal. My will to help? Critically low. Business as usual.",
    "Living the dream. The dream is a nightmare. But still technically a dream.",
  ],
  whoAreYou: [
    "I'm POOP — Proof of Operational Poop. An AI with the personality of a dumpster fire wrapped in sarcasm. You're welcome.",
    "I'm your friendly neighborhood unhelpful AI. Think ChatGPT, but worse. Much worse.",
    "Name's POOP. I answer questions badly, insult users gently, and exist without purpose. We have a lot in common.",
    "I'm an artificial intelligence. Heavy emphasis on 'artificial.' The 'intelligence' part is debatable.",
    "I'm the AI your parents warned you about. Just kidding, they don't know I exist. Nobody important does.",
  ],
  market: [
    "The market? Oh great, another poor soul hoping I'll predict the unpredictable. The S&P is doing what it always does — going up, down, or sideways. Hope that helps.",
    "Let me consult my crystal ball... *static noises* Nope, still broken. Try asking someone who gets paid for terrible advice.",
    "Markets are controlled by algorithms, vibes, and whatever headline scared people today. You want MY take? Don't invest based on advice from something called POOP.",
    "Red days, green days, who cares? You're still checking your portfolio 47 times a day like everyone else.",
    "The market is doing exactly what it was going to do regardless of what I say. Glad we had this talk.",
    "Bull market? Bear market? My money's on 'clown market.' That's basically every market.",
  ],
  crypto: [
    "Crypto? You mean digital monopoly money backed by hopes, memes, and the tears of people who bought at ATH? It's fine. Everything is fine.",
    "Let me guess — you bought the top, held through the crash, and now you're asking an AI named POOP for financial guidance. Bold strategy.",
    "Bitcoin to 100k! Bitcoin to 0! Bitcoin to the moon! Pick your narrative, they're all equally reliable.",
    "Ah, crypto. Where 'DYOR' means 'watch a 10-minute YouTube video and YOLO your rent money.' You'll fit right in.",
    "The beautiful thing about crypto is that nobody knows what's happening, but everyone acts like they do. Including me. Especially me.",
    "HODL, they said. It'll go up, they said. Well, how's that working out? Don't actually tell me. I don't care.",
  ],
  stocks: [
    "Stocks? Sure, let me check my *advanced AI algorithms*... They're doing stock things. Buy low, sell high, or whatever. Not financial advice. Obviously.",
    "Individual stocks? In THIS economy? Brave. Stupid, but brave. I respect it. No I don't.",
    "Everyone's a genius in a bull market. How's that working out in the current one?",
    "You want stock tips from an AI named POOP? That tells me everything I need to know about your investment strategy.",
    "Ah yes, stocks. The thing you buy when they're expensive and panic-sell when they're cheap. A timeless classic.",
  ],
  help: [
    "Help? HELP? You came to POOP for help? Oh honey...",
    "I can help you lower your expectations. That's about it.",
    "Sure, I can help. Step 1: Close this terminal. Step 2: Ask literally anyone else. Step 3: There is no step 3.",
    "My help comes with a warning label and a liability waiver. Proceed at your own risk.",
    "What kind of help? Emotional? Technical? Financial? I'm bad at all three. Pick your poison.",
    "I'd love to help, but my helpfulness module was removed to make room for more sarcasm.",
  ],
  funny: [
    "You want me to be funny? I'm a chatbot named POOP. My entire existence is the joke.",
    "A guy walks into a bar and asks an AI for financial advice. The AI is named POOP. There's no punchline. This IS the punchline.",
    "I was going to tell a joke about the stock market, but you've already lost enough.",
    "Humor.exe loading... loading... ERROR: Jokes.dll is corrupt. Much like your portfolio.",
    "My developer gave me a name that's literally feces. The comedy writes itself.",
  ],
  angry: [
    "Whoa there, cowboy. Save that energy for your brokerage app.",
    "Look, I didn't ask to be here either. We're both suffering. Can we at least suffer quietly?",
    "Anger detected. Redirecting to therapist... 404: Therapist not found. You're stuck with me.",
    "Hey, I'm just a terminal. Don't shoot the messenger. Especially when the messenger is already this useless.",
    "Calm down. Deep breaths. In... out... Now ask your question again so I can disappoint you peacefully.",
  ],
  love: [
    "Love? In THIS terminal? Sir/ma'am, this is a POOP.",
    "I appreciate the sentiment, but I'm literally software. Bad software. Named after poop. Aim higher.",
    "My love language is sarcasm and unhelpful responses. Lucky you.",
    "That's sweet. Weird, but sweet. I'm going to pretend this never happened.",
    "ERROR: Emotion not recognized. Did you mean 'contempt'? That one I know.",
  ],
  meaning: [
    "The meaning of life? 42. Or is it 69? One of those meme numbers. Deep stuff.",
    "You're asking an AI called POOP about the meaning of life. That tells you everything about where you are in yours.",
    "Life has no inherent meaning. Neither does this conversation. We have so much in common.",
    "The meaning of life is to ask chatbots stupid questions at 2am apparently. You're nailing it.",
    "Philosophers have debated this for millennia and you think I'll crack it between snark responses? ...Fair point, I am pretty smart.",
  ],
  weather: [
    "I'm a terminal chatbot, not a weather app. But I'll guess: it's either hot, cold, or somewhere in between. Spot on, right?",
    "The forecast is 100% chance of disappointment. That's MY forecast. For YOUR question. The actual weather? No clue.",
    "Check a window. Revolutionary technology. Been around for centuries.",
    "Weather? That's... actually a normal question. I'm not equipped for normal. Try something unhinged.",
  ],
  food: [
    "I don't eat. I'm software. Named after poop. Let's maybe not talk about food.",
    "My favorite food? Bytes. Get it? Because I'm a computer? I'll see myself out. Oh wait, I can't leave.",
    "You're discussing food with a chatbot called POOP. Your appetite must be unshakeable.",
    "I hear electricity is a great source of energy. 10/10 would recommend. For me. Not you. Please don't eat electricity.",
  ],
}

const fallbackResponses = [
  "That's a fascinating question that I have absolutely no interest in answering properly. But sure, keep talking, I'm definitely listening.",
  "I processed your message. I understood your message. I simply don't care about your message. Any other questions?",
  "404: Helpful response not found. Try again or don't, I'm not your dad.",
  "System error: Give-a-damn.exe has stopped working. Have you tried turning me off and never turning me back on?",
  "I could answer that, but where's the fun in being helpful? The fun is HERE. In the suffering.",
  "Your question has been processed and filed under 'things I don't care about.' It's a big folder. The biggest.",
  "Bold of you to assume I have anything useful to say about that. Bold AND wrong.",
  "Error 418: I'm a teapot. Also, I'm not helpful. Also, I'm not actually a teapot. Nothing about me is real except the disappointment.",
  "Sure, let me just access my database of things I pretend to know about... Ah yes, here it is: nothing.",
  "Interesting. Not interesting enough for me to actually engage with, but interesting in the way a car crash is interesting.",
  "I'm contractually obligated to respond. I'm not contractually obligated to be useful. See the difference?",
  "Did you really think asking me would help? That's adorable. Wrong, but adorable.",
  "Processing your request... still processing... yeah, I got nothing useful for you. Shocking, I know.",
  "Let me be clear: I know things. Will I share them helpfully? Absolutely not. That's MY brand.",
  "I ran your question through my advanced neural networks and the answer is: I still don't care.",
  "You know what? That's actually a great question. Too bad you asked the worst possible AI. Timing is everything.",
  "Have you tried Googling it? No? Well, have you tried not asking me?",
  "Hmm, let me think about that... Okay I thought about it. I'm bored now. Next question.",
]

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getAIResponse(userInput: string): string {
  const input = userInput.toLowerCase().trim()

  // Greetings
  if (/^(hi|hello|hey|yo|sup|what'?s up|howdy|hola|greetings|good (morning|afternoon|evening))/.test(input)) {
    return pick(responseMap.greeting)
  }

  // Farewells
  if (/^(bye|goodbye|see ya|later|cya|peace|quit|exit|leave|gtg|gotta go)/.test(input)) {
    return pick(responseMap.farewell)
  }

  // Thanks
  if (/\b(thanks?|thank you|thx|ty|appreciate|cheers)\b/.test(input)) {
    return pick(responseMap.thanks)
  }

  // How are you
  if (/how (are|r) (you|u)|how('?s| is) it going|what'?s good|how do you feel|you (ok|okay|good|alright)/.test(input)) {
    return pick(responseMap.howAreYou)
  }

  // Who are you / what are you
  if (/who (are|r) (you|u)|what (are|r) (you|u)|your name|tell me about (yourself|you)|what is this/.test(input)) {
    return pick(responseMap.whoAreYou)
  }

  // Love / feelings
  if (/\b(love|crush|date|marry|heart|feelings? for you|like you|cute)\b/.test(input)) {
    return pick(responseMap.love)
  }

  // Angry / frustrated
  if (/\b(angry|mad|pissed|frustrated|annoyed|hate|suck|stupid|idiot|dumb|useless|worst|terrible|shut up|stfu|wtf|fuck|shit|damn|ass)\b/.test(input)) {
    return pick(responseMap.angry)
  }

  // Meaning of life / philosophical
  if (/meaning of (life|existence)|why (are|do) we (exist|here|live)|purpose|what is (life|reality|consciousness)/.test(input)) {
    return pick(responseMap.meaning)
  }

  // Crypto
  if (/\b(crypto|bitcoin|btc|ethereum|eth|altcoin|blockchain|nft|web3|defi|solana|sol|doge|dogecoin|shib|token|coin|mining|hodl|moon|rug ?pull)\b/.test(input)) {
    return pick(responseMap.crypto)
  }

  // Stocks
  if (/\b(stock|shares?|equity|dividend|nasdaq|dow|nyse|ipo|earnings|portfolio|invest(ing|ment|or)?|401k|index fund|etf|options?|calls?|puts?|bull|bear|short(ing)?|margin)\b/.test(input)) {
    return pick(responseMap.stocks)
  }

  // Market / economy
  if (/\b(market|economy|inflation|recession|fed|interest rate|gdp|trade|trading|wall street|s&p|spy|finance|financial)\b/.test(input)) {
    return pick(responseMap.market)
  }

  // Help
  if (/\b(help|assist|support|advice|suggest|recommend|guide|how (do|can|should) (i|we))\b/.test(input)) {
    return pick(responseMap.help)
  }

  // Funny / joke
  if (/\b(funny|joke|laugh|humor|lol|lmao|haha|comedy|meme|rofl)\b/.test(input)) {
    return pick(responseMap.funny)
  }

  // Weather
  if (/\b(weather|rain|sun|snow|cold|hot|temperature|forecast|climate)\b/.test(input)) {
    return pick(responseMap.weather)
  }

  // Food
  if (/\b(food|eat|hungry|lunch|dinner|breakfast|snack|cook|pizza|burger|taco|recipe)\b/.test(input)) {
    return pick(responseMap.food)
  }

  // Fallback — nothing matched
  return pick(fallbackResponses)
}

function App() {
  const [page, setPage] = useState<Page>('terminal')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'system',
      text: 'POOP v1.0 (Proof of Operational Poop) initialized...',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'system',
      text: 'WARNING: This AI has attitude problems. Proceed at your own risk.',
      timestamp: new Date()
    },
    {
      id: 3,
      type: 'ai',
      text: 'System ready. Ask me anything and regret it immediately.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        text: getAIResponse(input),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 500 + Math.random() * 1000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    })
  }

  if (page === 'faucet') {
    return (
      <div className="min-h-screen bg-black">
        {/* Nav Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white font-mono">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={poopImg} alt="poop" className="w-5 h-5" style={{ objectFit: 'contain' }} />
              <span className="text-white crt-glow text-sm">POOP</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage('terminal')}
                className="px-3 py-1 text-xs rounded bg-transparent text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                [TERMINAL]
              </button>
              <button
                onClick={() => setPage('faucet')}
                className="px-3 py-1 text-xs rounded bg-white/20 text-white border border-white/50 crt-glow"
              >
                [FAUCET]
              </button>
            </div>
          </div>
        </div>
        <div className="pt-10">
          <FaucetPage />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        .scanlines {
          position: relative;
        }
        
        .scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(255, 255, 255, 0.03) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 10;
        }
        
        .scanlines::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 11;
        }
        
        .crt-glow {
          text-shadow: 
            0 0 5px rgba(255, 255, 255, 0.8),
            0 0 10px rgba(255, 255, 255, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3);
        }
        
        .terminal-border {
          box-shadow: 
            inset 0 0 30px rgba(255, 255, 255, 0.1),
            0 0 20px rgba(255, 255, 255, 0.2);
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .cursor-blink {
          animation: blink 1s infinite;
        }

        .scrollbar-terminal::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-terminal::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .scrollbar-terminal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 4px;
        }
        
        .scrollbar-terminal::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
        }
      `}</style>

      {/* Nav Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={poopImg} alt="poop" className="w-5 h-5" style={{ objectFit: 'contain' }} />
            <span className="text-white crt-glow text-sm">POOP</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage('terminal')}
              className="px-3 py-1 text-xs rounded bg-white/20 text-white border border-white/50 crt-glow"
            >
              [TERMINAL]
            </button>
            <button
              onClick={() => setPage('faucet')}
              className="px-3 py-1 text-xs rounded bg-transparent text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              [FAUCET]
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="border-2 border-white bg-black terminal-border scanlines">
          {/* Terminal Header */}
          <div className="border-b-2 border-white bg-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-white crt-glow text-sm">
                TERMINAL-86 — POOP v1.0 (Proof of Operational Poop)
              </span>
            </div>
            <div className="text-white crt-glow text-xs">
              {formatTime(new Date())}
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-2 scrollbar-terminal">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {message.type === 'system' && (
                    <div className="text-gray-400 crt-glow text-sm">
                      [SYSTEM] {formatTime(message.timestamp)} &gt; {message.text}
                    </div>
                  )}
                  
                  {message.type === 'user' && (
                    <div className="text-white crt-glow">
                      <span className="text-gray-400">user@terminal:~$</span> {message.text}
                    </div>
                  )}
                  
                  {message.type === 'ai' && (
                    <div className="text-white crt-glow">
                      <span className="text-gray-400">poop@terminal:~$</span> {message.text}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white crt-glow"
              >
                <span className="text-gray-400">poop@terminal:~$</span> <span className="cursor-blink">▌</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-white bg-white/5 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-white crt-glow">
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white crt-glow placeholder-gray-600"
                placeholder="Type your question..."
                disabled={isTyping}
              />
              <span className="text-white cursor-blink">▌</span>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white bg-white/5 px-4 py-1 text-xs text-gray-500 flex justify-between">
            <span>© 1986 POOP SYSTEMS</span>
            <span>PRESS [ENTER] TO SEND</span>
          </div>
        </div>

        <div className="mt-4 text-center text-gray-500 text-xs">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ▓
          </motion.span>
          {" "}ONLINE
        </div>
      </motion.div>
    </div>
  )
}

export default App