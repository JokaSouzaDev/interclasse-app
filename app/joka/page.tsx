'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  // Estados de Dados
  const [times, setTimes] = useState<any[]>([])
  const [partidas, setPartidas] = useState<any[]>([])
  
  // States de form
  const [nomeTime, setNomeTime] = useState('')
  const [serieTime, setSerieTime] = useState('')
  const [catTime, setCatTime] = useState('Masculino')
  const [editandoTime, setEditandoTime] = useState<string | null>(null)
  
  const [timeA, setTimeA] = useState('')
  const [timeB, setTimeB] = useState('')
  const [dataJogo, setDataJogo] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else carregarDados()
    }
    checkUser()
  }, [])

  async function carregarDados() {
    const { data: t } = await supabase.from('times').select('*').order('nome')
    const { data: p } = await supabase.from('partidas')
      .select('*, time_a:times!time_a_id(nome), time_b:times!time_b_id(nome)')
      .order('data_prevista', { ascending: true })
    
    setTimes(t || [])
    setPartidas(p || [])
  }

  // --- GESTÃO DE TIMES (CRIAR / EDITAR / EXCLUIR) ---
  async function salvarTime(e: React.FormEvent) {
    e.preventDefault()
    if (editandoTime) {
      await supabase.from('times').update({ nome: nomeTime, serie: serieTime, categoria: catTime }).eq('id', editandoTime)
      setEditandoTime(null)
    } else {
      await supabase.from('times').insert([{ nome: nomeTime, serie: serieTime, categoria: catTime, pontos: 0 }])
    }
    setNomeTime(''); setSerieTime(''); setCatTime('Masculino'); carregarDados()
  }

  async function excluirTime(id: string) {
    if (confirm("Excluir este time? Isso apagará partidas e gols vinculados!")) {
      await supabase.from('times').delete().eq('id', id)
      carregarDados()
    }
  }

  // --- GESTÃO DE PARTIDAS ---
  async function criarPartida(e: React.FormEvent) {
    e.preventDefault()
    if (!timeA || !timeB || !dataJogo) return alert("Preencha todos os campos")
    
    await supabase.from('partidas').insert([
      { time_a_id: timeA, time_b_id: timeB, data_prevista: dataJogo, status: 'agendado' }
    ])
    carregarDados()
  }

  async function excluirPartida(id: string) {
    if (confirm("Excluir esta partida?")) {
      await supabase.from('partidas').delete().eq('id', id)
      carregarDados()
    }
  }

  async function registrarGol(pId: string, tId: string, golsAtuais: number, timeRef: 'a' | 'b') {
    const nome = prompt("Nome do jogador que fez o gol:")
    if (!nome) return
    
    const col = timeRef === 'a' ? 'gols_a' : 'gols_b'
    await supabase.from('partidas').update({ [col]: golsAtuais + 1, status: 'em_andamento' }).eq('id', pId)
    await supabase.rpc('registrar_gol', { nome_player: nome, t_id: tId })
    carregarDados()
  }

  async function finalizarJogo(p: any) {
    if (!confirm("Encerrar jogo e somar pontos (3-1-0)?")) return
    
    let ptsA = 0, ptsB = 0
    if (p.gols_a > p.gols_b) ptsA = 3
    else if (p.gols_b > p.gols_a) ptsB = 3
    else { ptsA = 1; ptsB = 1 }

    await supabase.rpc('increment_points', { row_id: p.time_a_id, pts: ptsA })
    await supabase.rpc('increment_points', { row_id: p.time_b_id, pts: ptsB })
    await supabase.from('partidas').update({ finalizada: true, status: 'encerrado' }).eq('id', p.id)
    
    carregarDados()
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-black font-sans">
      <h1 className="text-2xl font-black mb-8 border-b pb-4">ADMINISTRAÇÃO INTERCLASSE</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CADASTRO E LISTA DE TIMES */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-bold mb-4 text-gray-500 uppercase text-xs">
              {editandoTime ? 'Editar Time' : 'Cadastrar Time'}
            </h2>
            <form onSubmit={salvarTime} className="space-y-3">
              <input className="w-full border p-2 rounded-lg" placeholder="Nome" value={nomeTime} onChange={e => setNomeTime(e.target.value)} required />
              <div className="flex gap-2">
                <input className="flex-1 border p-2 rounded-lg" placeholder="Série" value={serieTime} onChange={e => setSerieTime(e.target.value)} required />
                <select className="flex-1 border p-2 rounded-lg" value={catTime} onChange={e => setCatTime(e.target.value)}>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Ensino Médio</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold">
                {editandoTime ? 'ATUALIZAR' : 'SALVAR TIME'}
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {times.map(t => (
                    <tr key={t.id}>
                      <td className="p-3 font-medium">{t.nome} <span className="text-gray-400 text-xs">({t.categoria})</span></td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => {setEditandoTime(t.id); setNomeTime(t.nome); setSerieTime(t.serie); setCatTime(t.categoria)}} className="text-blue-600">Editar</button>
                        <button onClick={() => excluirTime(t.id)} className="text-red-500">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </section>
        </div>

        {/* AGENDAR E MONITORAR JOGOS */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-bold mb-4 text-gray-500 uppercase text-xs">Agendar Jogo</h2>
            <form onSubmit={criarPartida} className="space-y-3">
              <div className="flex gap-2 items-center">
                <select className="flex-1 border p-2 rounded-lg" value={timeA} onChange={e => setTimeA(e.target.value)} required>
                  <option value="">Time A</option>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <span className="font-bold text-gray-300">VS</span>
                <select className="flex-1 border p-2 rounded-lg" value={timeB} onChange={e => setTimeB(e.target.value)} required>
                  <option value="">Time B</option>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <input type="datetime-local" className="w-full border p-2 rounded-lg" value={dataJogo} onChange={e => setDataJogo(e.target.value)} required />
              <button className="w-full bg-green-600 text-white p-2 rounded-lg font-bold text-sm">MARCAR JOGO</button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-gray-500 uppercase text-xs">Jogos Ativos / Agendados</h2>
            {partidas.filter(p => !p.finalizada).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border relative">
                <button onClick={() => excluirPartida(p.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">✕</button>
                
                <div className="text-[10px] text-gray-400 font-bold mb-3 uppercase">
                  {p.status === 'em_andamento' ? '● AO VIVO' : '📅 ' + new Date(p.data_prevista).toLocaleString()}
                </div>

                <div className="flex justify-between items-center text-center mb-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{p.time_a?.nome}</p>
                    <button onClick={() => registrarGol(p.id, p.time_a_id, p.gols_a, 'a')} className="mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ GOL</button>
                  </div>
                  <div className="text-2xl font-black px-4">{p.gols_a} - {p.gols_b}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{p.time_b?.nome}</p>
                    <button onClick={() => registrarGol(p.id, p.time_b_id, p.gols_b, 'b')} className="mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ GOL</button>
                  </div>
                </div>

                <button onClick={() => finalizarJogo(p)} className="w-full bg-gray-800 text-white py-2 rounded-lg text-[10px] font-bold hover:bg-black transition">
                  FINALIZAR JOGO E SOMAR PONTOS
                </button>
              </div>
            ))}
          </section>
        </div>

      </div>
    </div>
  )
}