'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [showAdminForm, setShowAdminForm] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  async function loginAdmin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Acesso negado. Verifique suas credenciais.')
      setLoading(false)
    } else {
      router.push('/joka')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-black text-blue-500 mb-2 tracking-tighter">INTERCLASSE</h1>
        <p className="text-slate-400 mb-10 text-lg">Painel de Resultados 2026</p>

        <div className="space-y-4">
          {/* BOTÃO PÚBLICO */}
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            VER PLACAR AO VIVO
          </button>

          <div className="py-4 flex items-center gap-4 text-slate-600 uppercase text-xs font-bold">
            <div className="h-px bg-slate-800 flex-1"></div> ou <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* BOTÃO ADMIN (MOSTRA FORMULÁRIO) */}
          {!showAdminForm ? (
            <button 
              onClick={() => setShowAdminForm(true)}
              className="w-full bg-transparent hover:bg-blue-600/10 text-blue-500 font-bold py-4 rounded-2xl border border-blue-500/30 transition-all"
            >
              Acesso Organizador
            </button>
          ) : (
            <form onSubmit={loginAdmin} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-left space-y-4 animate-in fade-in zoom-in duration-300">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">E-mail Admin</label>
                <input 
                  type="email" required
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                <input 
                  type="password" required
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <button disabled={loading} className="w-full bg-blue-600 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                {loading ? 'Validando...' : 'Entrar no Painel'}
              </button>
              {erro && <p className="text-red-400 text-center text-sm mt-2">{erro}</p>}
              <button type="button" onClick={() => setShowAdminForm(false)} className="w-full text-slate-500 text-xs mt-2 underline">Voltar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}