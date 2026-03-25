import { useState, useCallback, useEffect } from 'react'
import { 
  Send, AlertCircle, CheckCircle2, Info, Sparkles, MessageSquareQuote, 
  Copy, RefreshCw, User, Briefcase, Heart, ShoppingCart, History, 
  Trash2, ChevronRight, Moon, Sun, Trophy, Target, Zap 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Tone = 'aggressive' | 'neutral' | 'friendly' | 'empathetic' | 'anxious' | 'dismissive'
type Recipient = 'professional' | 'friend' | 'customer'

interface AnalysisResult {
  id: string
  timestamp: number
  originalText: string
  recipient: Recipient
  tone: Tone
  score: number
  feedback: string
  suggestion: string
  rephrased?: string
}

interface UserStats {
  streak: number
  totalAnalyzed: number
  empatheticCount: number
  lastActive: string // ISO date
}

const mockAnalyze = (text: string, recipient: Recipient): AnalysisResult => {
  const lowercase = text.toLowerCase()
  const id = Math.random().toString(36).substring(7)
  const timestamp = Date.now()
  
  // Professional Context
  if (recipient === 'professional') {
    if (lowercase.includes('perché non hai') || lowercase.includes('subito') || lowercase.includes('!!') || lowercase.includes('urgente')) {
      return {
        id, timestamp, originalText: text, recipient,
        tone: 'aggressive',
        score: 25,
        feedback: "In un contesto professionale, questo tono può sembrare eccessivamente autoritario o accusatorio.",
        suggestion: "Prova a focalizzarti sul risultato desiderato invece che sull'errore altrui.",
        rephrased: "Ciao, volevo chiederti se ci sono aggiornamenti su questo task. Sarebbe importante averlo pronto entro oggi, fammi sapere se posso aiutarti in qualche modo!"
      }
    }
    if (lowercase.includes('problema') || lowercase.includes('errore') || lowercase.includes('colpa')) {
      return {
        id, timestamp, originalText: text, recipient,
        tone: 'anxious',
        score: 45,
        feedback: "Il messaggio trasmette tensione. Potrebbe preoccupare il destinatario.",
        suggestion: "Prova a presentare il problema insieme a una possibile soluzione.",
        rephrased: "Ho notato una piccola discrepanza nel progetto. Sto già verificando le possibili soluzioni, ti aggiorno a breve."
      }
    }
  }

  // Customer Context
  if (recipient === 'customer') {
    if (lowercase.includes('non possiamo') || lowercase.includes('impossibile') || lowercase.includes('regolamento')) {
      return {
        id, timestamp, originalText: text, recipient,
        tone: 'dismissive',
        score: 35,
        feedback: "Con un cliente, un 'no' secco può sembrare scortese.",
        suggestion: "Usa un linguaggio più orientato alla soluzione (Positive Language).",
        rephrased: "Al momento questa opzione non è disponibile, ma sarei felice di proporti un'alternativa che potrebbe soddisfare le tue esigenze!"
      }
    }
    if (lowercase.includes('grazie per la pazienza') || lowercase.includes('capisco perfettamente')) {
      return {
        id, timestamp, originalText: text, recipient,
        tone: 'empathetic',
        score: 98,
        feedback: "Eccellente! Stai creando un forte legame di fiducia con il cliente.",
        suggestion: "Il tono è perfetto, molto professionale ed empatico.",
        rephrased: text
      }
    }
  }

  // Friendly Context
  if (recipient === 'friend') {
    if (lowercase.length < 10 && !lowercase.includes('ciao') && !lowercase.includes('?')) {
      return {
        id, timestamp, originalText: text, recipient,
        tone: 'neutral',
        score: 55,
        feedback: "Il messaggio è molto breve. Con un amico, potrebbe sembrare che tu sia arrabbiato o di fretta.",
        suggestion: "Aggiungi un'emoji o un saluto per ammorbidire il tono.",
        rephrased: "Ehi! " + text + " 😊 Tutto bene?"
      }
    }
  }

  // General Positive
  if (lowercase.includes('scusa') || lowercase.includes('grazie') || lowercase.includes('per favore')) {
    return {
      id, timestamp, originalText: text, recipient,
      tone: 'friendly',
      score: 95,
      feedback: "Ottimo! Stai comunicando con grande rispetto ed empatia.",
      suggestion: "Il messaggio è perfetto così com'è.",
      rephrased: text
    }
  }

  // Default Neutral
  return {
    id, timestamp, originalText: text, recipient,
    tone: 'neutral',
    score: 65,
    feedback: "Il messaggio è chiaro, ma manca di quel tocco di calore che rende la comunicazione più fluida.",
    suggestion: "Potresti iniziare con un saluto o concludere con un ringraziamento.",
    rephrased: recipient === 'professional' ? "Buongiorno, " + text + ". Grazie!" : "Ciao! " + text + ". A presto!"
  }
}

function App() {
  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState<Recipient>('professional')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<AnalysisResult[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    totalAnalyzed: 0,
    empatheticCount: 0,
    lastActive: new Date().toISOString()
  })

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('empathy_theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('empathy_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('empathy_theme', 'light')
    }
  }

  // Stats & History persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('empathy_history')
    const savedStats = localStorage.getItem('empathy_stats')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedStats) setStats(JSON.parse(savedStats))
  }, [])

  useEffect(() => {
    localStorage.setItem('empathy_history', JSON.stringify(history))
    localStorage.setItem('empathy_stats', JSON.stringify(stats))
  }, [history, stats])

  const handleAnalyze = () => {
    if (!message.trim()) return
    setIsAnalyzing(true)
    setTimeout(() => {
      const newResult = mockAnalyze(message, recipient)
      setResult(newResult)
      setHistory(prev => [newResult, ...prev].slice(0, 10))
      
      // Update Stats
      setStats(prev => {
        const today = new Date().toISOString().split('T')[0]
        const lastActiveDate = prev.lastActive.split('T')[0]
        let newStreak = prev.streak
        
        if (lastActiveDate !== today) {
          // Check if yesterday
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          if (lastActiveDate === yesterday.toISOString().split('T')[0]) {
            newStreak += 1
          } else {
            newStreak = 1
          }
        } else if (newStreak === 0) {
          newStreak = 1
        }

        return {
          ...prev,
          totalAnalyzed: prev.totalAnalyzed + 1,
          empatheticCount: newResult.score > 70 ? prev.empatheticCount + 1 : prev.empatheticCount,
          streak: newStreak,
          lastActive: new Date().toISOString()
        }
      })
      
      setIsAnalyzing(false)
    }, 800)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('empathy_history')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-6 md:p-12 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">Empathy Navigator</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick Stats Chips */}
            <div className="hidden md:flex items-center gap-2 mr-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {stats.streak}d Streak
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                <Trophy className="w-3.5 h-3.5" />
                {stats.empatheticCount}
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <main className="grid lg:grid-cols-12 gap-8">
          {/* Left Column (Main App & History) */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">Destinatario</span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                  {(['professional', 'friend', 'customer'] as Recipient[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRecipient(r)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all capitalize flex items-center gap-2",
                        recipient === r 
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      )}
                    >
                      {r === 'professional' && <Briefcase className="w-4 h-4" />}
                      {r === 'friend' && <Heart className="w-4 h-4" />}
                      {r === 'customer' && <ShoppingCart className="w-4 h-4" />}
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute top-6 left-6 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                  <MessageSquareQuote className="w-8 h-8" />
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inizia a scrivere il tuo messaggio qui..."
                  className="w-full h-56 pl-20 pr-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-950 focus:ring-[12px] focus:ring-indigo-500/5 transition-all text-xl leading-relaxed resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                  <span>{message.length} caratteri</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMessage('')}
                    className="px-6 py-4 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 text-sm font-bold transition-colors"
                  >
                    Resetta
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !message.trim()}
                    className={cn(
                      "px-10 py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-[1.5rem] font-black tracking-wide flex items-center gap-3 transition-all hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:grayscale",
                      isAnalyzing && "animate-pulse"
                    )}
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {isAnalyzing ? "ANALIZZANDO..." : "ANALIZZA ORA"}
                  </button>
                </div>
              </div>
            </section>

            {/* History Grid */}
            {history.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <History className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Le tue ultime analisi</span>
                  </div>
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors"
                  >
                    Pulisci tutto
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setMessage(item.originalText)
                        setRecipient(item.recipient)
                        setResult(item)
                      }}
                      className="group p-5 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-none transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          item.score > 70 ? "bg-emerald-500" : item.score > 40 ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 transition-colors">
                          {item.recipient}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        "{item.originalText}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Results & Stats) */}
          <div className="lg:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6 sticky top-8"
                >
                  {/* Premium Result Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-[10px]">Analisi Empatia</h2>
                      <div className={cn(
                        "px-4 py-1 rounded-full text-xs font-black tracking-wider",
                        result.score > 70 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : 
                        result.score > 40 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : 
                        "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
                      )}>
                        {result.tone.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        className={cn(
                          "h-full rounded-full shadow-lg shadow-current/20",
                          result.score > 70 ? "bg-emerald-500 text-emerald-500" : 
                          result.score > 40 ? "bg-amber-500 text-amber-500" : 
                          "bg-rose-500 text-rose-500"
                        )}
                      />
                      <div className="absolute -top-10 right-0">
                        <span className={cn(
                          "text-4xl font-black",
                          result.score > 70 ? "text-emerald-500" : result.score > 40 ? "text-amber-500" : "text-rose-500"
                        )}>
                          {result.score}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-loose font-medium italic border-l-4 border-slate-100 dark:border-slate-800 pl-4">
                      {result.feedback}
                    </p>
                  </div>

                  {/* Suggestion Card */}
                  <div className="bg-indigo-600 dark:bg-indigo-500 rounded-[2rem] shadow-xl shadow-indigo-200 dark:shadow-none p-8 text-white relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest opacity-80">Suggerimento AI</h3>
                    </div>
                    
                    <p className="text-indigo-50 leading-relaxed text-lg font-medium mb-8">
                      "{result.suggestion}"
                    </p>
                    
                    {result.rephrased && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Riformulazione</h4>
                          <button 
                            onClick={() => copyToClipboard(result.rephrased!)}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
                          >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="bg-slate-950/20 p-6 rounded-2xl text-sm leading-relaxed border border-white/5 font-medium">
                          {result.rephrased}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-8">Il tuo impatto</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Zap className="w-4 h-4 fill-current" />
                          <span className="text-2xl font-black">{stats.streak}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Streak Giorni</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Trophy className="w-4 h-4" />
                          <span className="text-2xl font-black">{stats.empatheticCount}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Empatia Max</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Target className="w-4 h-4" />
                          <span className="text-2xl font-black">{stats.totalAnalyzed}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Totale Analisi</p>
                      </div>
                      <div className="space-y-2 text-slate-300 dark:text-slate-800">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="text-2xl font-black">---</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase">Prossimo Goal</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 text-center bg-slate-100/30 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <RefreshCw className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-4 animate-spin-slow" />
                    <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">In attesa del tuo prossimo messaggio...</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="mt-20 py-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 Empathy Navigator • AI Driven Communication</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Termini</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Supporto</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
