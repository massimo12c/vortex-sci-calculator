import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { create, all } from 'mathjs'
import { 
  X, 
  ChevronRight, Divide, Plus, Minus, Equal, Trash2,
  Clock, Cpu, Zap, Layout, Palette, LineChart as ChartIcon, Calculator as CalcIcon,
  Activity
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const math = create(all)

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

type Theme = 'indigo' | 'gold' | 'rose' | 'emerald' | 'cyan'
type Mode = 'calculator' | 'graph'

interface ThemeConfig {
  name: string
  primary: string
  glow: string
  accent: string
  hex: string
}

const themes: Record<Theme, ThemeConfig> = {
  indigo: { name: 'Vortex Indigo', primary: 'indigo-500', glow: 'bg-indigo-600/20', accent: 'text-indigo-400', hex: '#6366f1' },
  gold: { name: 'Luxury Gold', primary: 'amber-500', glow: 'bg-amber-600/20', accent: 'text-amber-400', hex: '#f59e0b' },
  rose: { name: 'Cyber Rose', primary: 'rose-500', glow: 'bg-rose-600/20', accent: 'text-rose-400', hex: '#f43f5e' },
  emerald: { name: 'Forest Emerald', primary: 'emerald-500', glow: 'bg-emerald-600/20', accent: 'text-emerald-400', hex: '#10b981' },
  cyan: { name: 'Neon Cyan', primary: 'cyan-500', glow: 'bg-cyan-600/20', accent: 'text-cyan-400', hex: '#06b6d4' }
}

const buttons = [
  { label: '(', type: 'sci' }, { label: ')', type: 'sci' }, { label: 'mc', type: 'mem' }, { label: 'm+', type: 'mem' }, { label: 'm-', type: 'mem' }, { label: 'mr', type: 'mem' },
  { label: 'x²', type: 'sci', value: '^2' }, { label: 'x³', type: 'sci', value: '^3' }, { label: 'xʸ', type: 'sci', value: '^' }, { label: 'eˣ', type: 'sci', value: 'exp(' }, { label: '10ˣ', type: 'sci', value: '10^' }, { label: 'ln', type: 'sci', value: 'log(' },
  { label: '1/x', type: 'sci', value: '1/' }, { label: '√x', type: 'sci', value: 'sqrt(' }, { label: '∛x', type: 'sci', value: 'cbrt(' }, { label: 'ʸ√x', type: 'sci', value: 'nthRoot(' }, { label: 'log₁₀', type: 'sci', value: 'log10(' }, { label: 'x!', type: 'sci', value: '!' },
  { label: 'sin', type: 'sci' }, { label: 'cos', type: 'sci' }, { label: 'tan', type: 'sci' }, { label: 'e', type: 'const' }, { label: 'π', type: 'const' }, { label: 'Rand', type: 'sci', value: 'random()' },
  { label: 'C', type: 'clear' }, { label: '+/-', type: 'func' }, { label: '%', type: 'op' }, { label: '÷', type: 'op', value: '/', icon: <Divide className="w-5 h-5" /> },
  { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op', value: '*', icon: <X className="w-5 h-5" /> },
  { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op', icon: <Minus className="w-5 h-5" /> },
  { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op', icon: <Plus className="w-5 h-5" /> },
  { label: '0', type: 'num', wide: true }, { label: '.', type: 'num' }, { label: '=', type: 'equal', icon: <Equal className="w-6 h-6" /> },
]

export default function ScientificCalculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState<{ expr: string; result: string; timestamp: number }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc-history')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [memory, setMemory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc-memory')
      return saved ? parseFloat(saved) : 0
    }
    return 0
  })
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<Theme>('indigo')
  const [mode, setMode] = useState<Mode>('calculator')
  const [graphExpr, setGraphExpr] = useState('sin(x)')
  
  const theme = themes[currentTheme]

  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('calc-memory', memory.toString())
  }, [memory])

  const graphData = useMemo(() => {
    const data = []
    try {
      const parser = math.parser()
      for (let x = -10; x <= 10; x += 0.5) {
        parser.set('x', x)
        const y = parser.evaluate(graphExpr)
        if (typeof y === 'number' && !isNaN(y)) {
          data.push({ x: x.toFixed(1), y: parseFloat(y.toFixed(4)) })
        }
      }
    } catch (e) { /* silent fail for invalid expr */ }
    return data
  }, [graphExpr])

  const handleButtonClick = (btn: typeof buttons[0]) => {
    const { label, type, value } = btn
    const val = value || label
    if (type === 'num') {
      if (display === '0' || lastResult !== null) { setDisplay(val); setLastResult(null); }
      else { setDisplay(display + val); }
    } else if (type === 'clear') { setDisplay('0'); setExpression(''); setLastResult(null); }
    else if (type === 'op') {
      if (lastResult !== null) { setExpression(lastResult + ' ' + val + ' '); setLastResult(null); }
      else { setExpression(expression + display + ' ' + val + ' '); }
      setDisplay('0')
    } else if (type === 'equal') {
      try {
        const finalExpr = (expression + display).replace('×', '*').replace('÷', '/')
        const result = math.evaluate(finalExpr)
        const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '')
        setHistory(prev => [{ expr: finalExpr, result: formattedResult, timestamp: Date.now() }, ...prev].slice(0, 20))
        setDisplay(formattedResult); setExpression(''); setLastResult(formattedResult)
      } catch (e) { setDisplay('Error') }
    } else if (type === 'sci') {
      try {
        if (['sin', 'cos', 'tan'].includes(label)) {
          const res = math.evaluate(`${label}(${display})`)
          setDisplay(res.toFixed(8).replace(/\.?0+$/, ''))
        } else if (val.includes('(')) { setDisplay(math.evaluate(`${val}${display})`).toString()) }
        else { setDisplay(math.evaluate(`${display}${val}`).toString()) }
        setLastResult(display)
      } catch (e) { setDisplay('Error') }
    } else if (type === 'const') { setDisplay(math.evaluate(label === 'π' ? 'pi' : 'e').toString()); setLastResult(null); }
    else if (type === 'mem') {
      if (label === 'mc') setMemory(0)
      if (label === 'm+') setMemory(memory + parseFloat(display))
      if (label === 'm-') setMemory(memory - parseFloat(display))
      if (label === 'mr') setDisplay(memory.toString())
    } else if (label === '+/-') { setDisplay((parseFloat(display) * -1).toString()) }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 md:p-12 font-sans overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse opacity-20 transition-colors duration-700", theme.glow)} />
        <div className={cn("absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse [animation-delay:2s] opacity-20 transition-colors duration-700", theme.glow)} />
      </div>

      <div className="max-w-7xl w-full grid lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-3 space-y-8 hidden lg:block">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn("p-3 bg-white/5 rounded-2xl border border-white/10 transition-colors duration-500", theme.accent)}><Cpu className="w-6 h-6" /></div>
              <div><h1 className="text-lg font-bold tracking-tight">{theme.name}</h1><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dual Engine Active</p></div>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-slate-500">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Memory Bank</span>
                </div>
                <div className={cn("text-2xl font-light truncate transition-colors duration-500", theme.accent)}>
                  {memory.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-4 text-slate-500"><Palette className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Select Vibe</span></div>
                <div className="flex justify-between">
                  {(Object.keys(themes) as Theme[]).map((t) => (
                    <button key={t} onClick={() => setCurrentTheme(t)} className={cn("w-8 h-8 rounded-full border-2 transition-all hover:scale-110", currentTheme === t ? "border-white scale-125" : "border-transparent opacity-50", t === 'indigo' ? "bg-indigo-500" : t === 'gold' ? "bg-amber-500" : t === 'rose' ? "bg-rose-500" : t === 'emerald' ? "bg-emerald-500" : "bg-cyan-500")} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => setMode('calculator')} className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all", mode === 'calculator' ? `bg-${theme.primary}/20 border-${theme.primary}/30 ${theme.accent}` : "bg-white/5 border-white/10 text-slate-500")}><CalcIcon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Calculator</span></button>
                <button onClick={() => setMode('graph')} className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all", mode === 'graph' ? `bg-${theme.primary}/20 border-${theme.primary}/30 ${theme.accent}` : "bg-white/5 border-white/10 text-slate-500")}><ChartIcon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Visualizer</span></button>
              </div>
            </div>
          </motion.div>
          <a href="https://github.com" target="_blank" className={cn("flex items-center justify-between p-6 rounded-[2rem] text-white shadow-xl transition-all group overflow-hidden relative duration-700", `bg-${theme.primary} hover:bg-${theme.primary}/80 shadow-${theme.primary}/20`)}><div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" /><div className="flex items-center gap-4 relative z-10"><GithubIcon /><span className="text-sm font-bold">Sync to GitHub</span></div><ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" /></a>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-6 bg-[#0a0f1e]/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[850px]">
          <div className="h-1.5 w-full flex"><div className={cn("h-full flex-1 transition-colors duration-700 bg-white/10", `bg-${theme.primary}/50`)} /><div className={cn("h-full flex-1 transition-colors duration-700 bg-white/5", `bg-${theme.primary}/30`)} /><div className={cn("h-full flex-1 transition-colors duration-700 bg-white/10", `bg-${theme.primary}/50`)} /></div>
          
          <AnimatePresence mode="wait">
            {mode === 'calculator' ? (
              <motion.div key="calc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
                <div className="p-10 flex flex-col justify-end flex-grow text-right group">
                  <AnimatePresence mode="wait"><motion.div key={expression} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.4, y: 0 }} className={cn("text-lg font-medium mb-2 truncate px-4 transition-colors duration-700", theme.accent)}>{expression || <span className="opacity-20 italic font-light tracking-widest text-[10px] uppercase">Scientific Engine Active</span>}</motion.div></AnimatePresence>
                  <motion.div layout className="text-8xl font-thin tracking-tighter text-white px-4 truncate leading-none">{display}</motion.div>
                </div>
                <div className="bg-white/[0.02] p-8 rounded-t-[3rem] border-t border-white/5">
                  <div className="grid grid-cols-6 gap-3 mb-6">
                    {buttons.filter(b => b.type === 'sci' || b.type === 'mem' || b.type === 'const').map((btn, i) => (
                      <button key={i} onClick={() => handleButtonClick(btn)} className={cn("h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5 transition-all active:scale-95", `hover:${theme.accent}`)}>{btn.label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {buttons.filter(b => !['sci', 'mem', 'const'].includes(b.type)).map((btn, i) => (
                      <button key={i} onClick={() => handleButtonClick(btn)} className={cn("h-16 rounded-[1.25rem] text-xl font-bold transition-all flex items-center justify-center relative group active:scale-95", btn.type === 'num' ? "bg-white/5 hover:bg-white/10 text-white border border-white/5" : btn.type === 'op' ? `bg-${theme.primary}/10 hover:bg-${theme.primary}/20 ${theme.accent} border border-${theme.primary}/10` : btn.type === 'clear' ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10" : btn.type === 'equal' ? `bg-${theme.primary} hover:opacity-80 text-white shadow-xl shadow-${theme.primary}/30 col-span-1 h-16` : "bg-slate-800/50 text-slate-400", btn.wide && "col-span-2")}>{btn.icon || btn.label}<div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.25rem]" /></button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="graph" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full p-8">
                <div className="flex items-center justify-between mb-8 px-4">
                  <div><h2 className="text-2xl font-bold">Function Visualizer</h2><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Real-time Rendering</p></div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><Activity className={cn("w-5 h-5", theme.accent)} /></div>
                </div>
                <div className="bg-white/[0.03] rounded-[2rem] border border-white/10 p-6 flex-grow mb-8 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="x" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="y" stroke={theme.hex} strokeWidth={3} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <span className={cn("text-xl font-black italic", theme.accent)}>f(x) =</span>
                    <input type="text" value={graphExpr} onChange={(e) => setGraphExpr(e.target.value)} className="bg-transparent border-none outline-none text-2xl font-light w-full placeholder:text-slate-800" placeholder="e.g. sin(x) * x" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['sin(x)', 'cos(x)', 'tan(x)', 'x^2', 'log(x)', 'abs(x)'].map(fn => (
                      <button key={fn} onClick={() => setGraphExpr(fn)} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">{fn}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 h-[850px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-slate-500"><Clock className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">History Log</span></div>
              <button onClick={() => setHistory([])} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-slate-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {history.length > 0 ? history.map((item) => (
                  <motion.div layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={item.timestamp} onClick={() => { setDisplay(item.result); setLastResult(item.result); }} className="p-5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group cursor-pointer relative overflow-hidden"><div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"><Zap className={cn("w-3 h-3", theme.accent)} /></div><div className="text-[10px] text-slate-500 font-bold mb-2 truncate pr-4">{item.expr}</div><div className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">= {item.result}</div></motion.div>
                )) : <div className="h-full flex flex-col items-center justify-center text-center opacity-10"><Layout className="w-16 h-16 mb-4" /><p className="text-xs font-black uppercase tracking-[0.3em]">No Logs</p></div>}
              </AnimatePresence>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5"><div className="flex items-center justify-between px-2"><div className="flex flex-col"><span className="text-[10px] font-black text-slate-600 uppercase">System Status</span><span className="text-xs font-bold text-emerald-400">Stable</span></div><div className="flex flex-col text-right"><span className="text-[10px] font-black text-slate-600 uppercase">Latency</span><span className={cn("text-xs font-bold transition-colors duration-700", theme.accent)}>0.04ms</span></div></div></div>
          </section>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }`}} />
    </div>
  )
}
