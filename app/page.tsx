'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  PlayCircle,
  Crown,
  Star,
  Zap,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [times, setTimes] = useState<any[]>([])
  const [partidas, setPartidas] = useState<any[]>([])
  const [artilharia, setArtilharia] = useState<any[]>([])
  const [filtroCat, setFiltroCat] = useState('Todos')
  const [loading, setLoading] = useState(true)

  const carregarDados = useCallback(async () => {
    setLoading(true)

    // 1. Busca Classificação
    const { data: t } = await supabase
      .from('times')
      .select('*')
      .order('pontos', { ascending: false })
      .order('nome', { ascending: true })

    // 2. Busca Partidas com os nomes dos times
    const { data: p } = await supabase
      .from('partidas')
      .select('*, time_a:times!time_a_id(nome, categoria), time_b:times!time_b_id(nome, categoria)')
      .order('data_prevista', { ascending: true })

    // 3. Busca Artilharia (Top 5)
    const { data: art } = await supabase
      .from('artilharia')
      .select('*, times(nome)')
      .order('gols', { ascending: false })
      .limit(5)

    setTimes(t || [])
    setPartidas(p || [])
    setArtilharia(art || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    carregarDados()
    // Atualização em tempo real a cada 30 segundos
    const interval = setInterval(carregarDados, 30000)
    return () => clearInterval(interval)
  }, [carregarDados])

  // Lógica de filtro para a tabela e para os jogos
  const timesFiltrados = filtroCat === 'Todos' ? times : times.filter(t => t.categoria === filtroCat)
  const partidasFiltradas = filtroCat === 'Todos' 
    ? partidas 
    : partidas.filter(p => p.time_a?.categoria === filtroCat || p.time_b?.categoria === filtroCat)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans overflow-x-hidden relative">
      {/* Luxury background pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(251,191,36,0.03)_25%,transparent_25%),linear-gradient(-45deg,rgba(251,191,36,0.03)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(251,191,36,0.03)_75%),linear-gradient(-45deg,transparent_75%,rgba(251,191,36,0.03)_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]" />
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b border-gray-800/50 bg-black/80 backdrop-blur-2xl sticky top-0 z-50 shadow-2xl shadow-amber-500/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.03 }}
          >
            <div className="w-15 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/50">
              <Trophy className="w-8 h-8 text-gray-900 font-bold" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight  bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                 ANTÔNIO PRÁTICI
              </h1>
              <p className="text-sm text-amber-400/90 font-bold tracking-wider uppercase">2026</p>
            </div>
          </motion.div>

          <motion.button
            onClick={() => router.push('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-3xl font-bold text-sm uppercase tracking-wide hover:from-amber-500/20 hover:to-yellow-500/20 hover:border-amber-400/50 hover:shadow-amber-500/30 transition-all duration-500 overflow-hidden backdrop-blur-xl"
          >
            <span className="relative z-10">ÁREA DO ORGANIZADOR</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-yellow-500/30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100" />
          </motion.button>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-6 py-16 pb-24 relative z-10">
        {/* Header com Filtro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-5xl font-black tracking-tighter italic text-amber-400 drop-shadow-2xl mb-3">
                Painel de Resultados
              </h1>
              <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">Interclasse 2026</p>
            </div>
            <motion.span 
              className="text-xs bg-gray-800/50 px-4 py-2 rounded-full text-gray-400 font-bold uppercase backdrop-blur-sm border border-gray-700/50 animate-pulse"
              whileHover={{ scale: 1.05 }}
            >
              Live Update On
            </motion.span>
          </div>

          {/* Filtro de Categoria */}
          <motion.div 
            className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {['Todos', 'Masculino', 'Feminino', 'Ensino Médio'].map(cat => (
              <motion.button 
                key={cat} 
                onClick={() => setFiltroCat(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative px-8 py-4 rounded-3xl font-bold uppercase text-sm tracking-wide transition-all whitespace-nowrap backdrop-blur-xl shadow-lg ${
                  filtroCat === cat 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 border-2 border-amber-400/50 shadow-amber-500/40 scale-105' 
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-amber-400/30 hover:text-amber-300'
                }`}
              >
                <span className="relative z-10">{cat}</span>
                
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Tabela Classificação */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                  Tabela de Classificação
                </h2>
                <span className="text-xs bg-amber-500/20 px-4 py-2 rounded-full text-amber-300 font-bold uppercase tracking-wider border border-amber-400/30">
                  {filtroCat}
                </span>
              </div>
              <div className="bg-black/40 backdrop-blur-2xl border border-gray-700/50 rounded-4xl overflow-hidden shadow-2xl shadow-gray-900/50">
                <table className="w-full">
                  <thead className="bg-gray-900/60 backdrop-blur-sm text-gray-400 text-xs uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-8 w-20 text-left">Pos</th>
                      <th className="p-8 text-left">Time</th>
                      <th className="p-8 text-center">Série</th>
                      <th className="p-8 text-right w-24">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/30">
                    {timesFiltrados.map((t, i) => (
                      <motion.tr 
                        key={t.id} 
                        className="group hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-all duration-500 border-b border-gray-800/20 last:border-b-0"
                        whileHover={{ scale: [1, 1.01, 1] }}
                      >
                        <td className="p-8">
                          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl transition-all group-hover:scale-110 ${
                            i === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-gray-900 shadow-amber-500/50' :
                            i === 1 ? 'bg-gray-700/70 text-white shadow-gray-500/30' :
                            i === 2 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-500/30' :
                            'bg-gray-800/50 text-gray-400 border border-gray-700/50'
                          }`}>
                            {i === 0 ? <Star className="w-6 h-6 text-amber-600 animate-pulse" /> : `${i+1}º`}
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full shadow-lg ${i < 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-500 animate-ping' : 'bg-gray-600/40'}`} />
                            <div>
                              <div className="font-black text-2xl bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text text-transparent group-hover:from-amber-400 group-hover:to-yellow-400 drop-shadow-xl">
                                {t.nome}
                              </div>
                              <div className="text-amber-400 font-bold uppercase text-xs mt-1 tracking-wider">{t.categoria}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-8 text-center">
                          <span className="px-6 py-3 bg-gray-800/40 text-gray-400 text-sm font-bold rounded-2xl border border-gray-700/50 backdrop-blur-xl">
                            {t.serie}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <span className="text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl">
                            {t.pontos || 0}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                    {timesFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-gray-600 text-lg italic font-medium"
                          >
                            Nenhum time nesta categoria
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* Próximos Jogos */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black uppercase tracking-widest mb-8 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
                Próximos Jogos & Ao Vivo
              </h2>
              <AnimatePresence>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 border border-gray-700/50 rounded-3xl p-10 backdrop-blur-2xl shadow-2xl animate-pulse"
                      >
                        <div className="h-8 bg-gray-800/50 rounded-2xl mb-6" />
                        <div className="h-20 bg-gray-800/30 rounded-3xl" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                    {partidasFiltradas.filter(p => !p.finalizada).map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          boxShadow: '0 30px 60px -12px rgba(251, 191, 36, 0.3)'
                        }}
                        className="group bg-gradient-to-br from-gray-900/90 to-black/60 border border-gray-700/50 backdrop-blur-2xl rounded-4xl p-10 hover:border-amber-500/40 hover:shadow-amber-500/20 transition-all duration-700 shadow-2xl overflow-hidden relative"
                      >
                        <div className="absolute top-6 right-6">
                          <StatusLuxo status={p.status} />
                        </div>
                        <div className="relative z-10 text-center">
                          <div className="text-sm font-bold uppercase text-gray-500 mb-8 tracking-wider">
                            {new Date(p.data_prevista).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="font-black uppercase text-2xl mb-2 group-hover:text-amber-300 transition-colors drop-shadow-lg">
                                {p.time_a?.nome || '---'}
                              </div>
                              <div className="text-xs uppercase text-gray-500">{p.time_a?.categoria}</div>
                            </div>
                            <div className="bg-black/50 backdrop-blur-2xl px-12 py-6 rounded-3xl border-4 border-gray-700/50 shadow-2xl flex items-center gap-6 group-hover:border-amber-400/50 transition-all">
                              <span className="text-4xl font-mono font-black text-amber-400 drop-shadow-lg">{p.gols_a || 0}</span>
                              <span className="text-gray-600 text-3xl font-mono">:</span>
                              <span className="text-4xl font-mono font-black text-emerald-400 drop-shadow-lg">{p.gols_b || 0}</span>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-black uppercase text-2xl mb-2 group-hover:text-emerald-300 transition-colors drop-shadow-lg">
                                {p.time_b?.nome || '---'}
                              </div>
                              <div className="text-xs uppercase text-gray-500">{p.time_b?.categoria}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {partidasFiltradas.filter(p => !p.finalizada).length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full bg-black/40 border border-gray-700/50 rounded-4xl p-20 text-center backdrop-blur-2xl shadow-2xl"
                      >
                        <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
                        <p className="text-xl text-gray-600 font-medium italic">Nenhuma partida marcada para agora</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-12 lg:sticky lg:top-24 lg:h-screen lg:overflow-y-auto">
            
            {/* Artilharia */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-500/15 to-yellow-500/15 backdrop-blur-2xl border border-amber-400/30 rounded-4xl p-10 shadow-2xl shadow-amber-500/25 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-6xl opacity-10 font-black italic tracking-widest text-gray-900 drop-shadow-2xl">⚽</div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-10 bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent relative z-10 text-center">
                Artilharia Top 5
              </h2>
              <div className="space-y-6 relative z-10">
                {artilharia.map((art, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 8, scale: 1.02 }}
                    className="flex items-center justify-between p-6 bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 group hover:bg-black/50 transition-all"
                  >
                    <div>
                      <p className="font-black text-lg text-white uppercase group-hover:text-amber-300 transition-colors drop-shadow-lg">
                        {art.nome_jogador}
                      </p>
                      <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">{art.times?.nome || 'Independente'}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center font-black text-gray-900 text-2xl shadow-2xl shadow-amber-500/50 group-hover:scale-110 transition-all">
                      {art.gols}
                    </div>
                  </motion.div>
                ))}
                {artilharia.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-amber-300 text-sm italic font-medium">Aguardando primeiros gols...</p>
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* Histórico Resultados */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-gray-500 font-black uppercase text-sm mb-8 px-4 tracking-widest italic border-b border-gray-800/50 pb-4">
                Últimos Resultados
              </h2>
              <div className="bg-black/40 backdrop-blur-xl rounded-4xl border border-gray-700/50 p-6 space-y-4 divide-y divide-gray-800/30 shadow-2xl">
                {partidasFiltradas.filter(p => p.finalizada).slice(0, 5).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center p-6 group hover:bg-black/60 rounded-3xl transition-all backdrop-blur-xl border border-gray-800/30"
                  >
                    <div className="text-sm font-bold text-gray-300">
                      <span className="text-gray-500">{p.time_a?.nome}</span> 
                      <span className="mx-3 text-amber-400 font-black text-lg">{p.gols_a} x {p.gols_b}</span>
                      <span className="text-gray-500">{p.time_b?.nome}</span>
                    </div>
                    <div className="text-xs bg-emerald-500/90 px-4 py-2 rounded-2xl text-white font-black uppercase tracking-wider shadow-lg">
                      Fim
                    </div>
                  </motion.div>
                ))}
                {partidasFiltradas.filter(p => p.finalizada).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <p className="text-gray-600 text-sm italic font-medium">Nenhum jogo encerrado ainda</p>
                  </motion.div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20 text-center text-gray-500/70 text-sm border-t border-gray-900/50 backdrop-blur-xl bg-black/30 mt-24"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center items-center gap-8 mb-8 opacity-70">
            <Zap className="w-6 h-6" />
            <Users className="w-6 h-6" />
            <Calendar className="w-6 h-6" />
          </div>
          <p>© 2026 Sistema Interclasse - Desenvolvido pelo JOKA NÉ VIDA</p>
          <p className="text-xs mt-3 text-gray-600 tracking-wide">Atualização em tempo real - F5 para atualizar a página</p>
        </div>
      </motion.footer>

      <style jsx>{`
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}

function StatusLuxo({ status }: { status: string }) {
  if (status === 'em_andamento') {
    return (
      <motion.span
        className="bg-gradient-to-r from-red-500/90 to-pink-500/90 text-white px-6 py-3 rounded-3xl text-xs font-bold uppercase tracking-wider shadow-2xl backdrop-blur-xl border border-red-500/50 animate-pulse"
        whileHover={{ scale: 1.05 }}
      >
        ● AO VIVO
      </motion.span>
    )
  }
  return (
    <motion.span
      className="bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white px-6 py-3 rounded-3xl text-xs font-bold uppercase tracking-wider shadow-2xl backdrop-blur-xl border border-emerald-400/50"
      whileHover={{ scale: 1.05 }}
    >
      Agendado
    </motion.span>
  )
}