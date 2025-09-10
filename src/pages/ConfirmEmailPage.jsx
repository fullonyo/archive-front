import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StableMatrixBackground from '../components/ui/StableMatrixBackground'

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState(null)
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      confirmEmail(token)
    } else {
      setStatus('error')
      setMessage('Token de confirmação não encontrado')
    }
  }, [token])

  const confirmEmail = async (confirmationToken) => {
    try {
      console.log('🔄 Confirmando email com token:', confirmationToken)
      
      const response = await api.get(`/register/confirm/${confirmationToken}`)
      
      console.log('✅ Email confirmado:', response.data)
      
      setStatus('success')
      setMessage(response.data.message)
      setUserData(response.data.data.user)
      toast.success('Email confirmado com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro na confirmação:', error)
      
      // Se email já foi confirmado, tratar como sucesso mas informar
      if (error.response?.data?.message?.includes('já foi confirmado') || 
          error.response?.data?.message?.includes('já está cadastrado')) {
        setStatus('already-confirmed')
        setMessage('Este email já foi confirmado anteriormente')
        toast.success('Email já confirmado! Você pode fazer login.')
        return
      }
      
      setStatus('error')
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else {
        setMessage('Erro ao confirmar email. Tente novamente.')
      }
      
      toast.error('Erro na confirmação do email')
    }
  }

  const resendEmail = async () => {
    if (!userData?.email) return
    
    try {
      await api.post('/register/resend', { email: userData.email })
      toast.success('Novo email enviado!')
    } catch (error) {
      toast.error('Erro ao reenviar email')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Discord Button */}
      <motion.a
        href="https://discord.gg/vrchieve"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-sm border border-[#5865F2]/30 hover:border-[#5865F2]/60 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 group"
      >
        <svg 
          viewBox="0 0 71 55" 
          className="w-5 h-5 text-[#5865F2]/70 group-hover:text-[#5865F2] transition-colors"
          fill="currentColor"
        >
          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
        </svg>
      </motion.a>

      {/* Matrix Background */}
      <StableMatrixBackground 
        stabilityDependencies={[status]}
        fallbackType="vrchat"
      />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 relative">
              <img 
                src="/logo.png" 
                alt="VRCHIEVE Logo" 
                className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Status Card */}
          <div className={`bg-slate-900/90 backdrop-blur-sm border rounded-xl p-8 shadow-2xl ${
            status === 'success' || status === 'already-confirmed'
              ? 'border-emerald-500/30 shadow-emerald-500/20' 
              : status === 'error'
              ? 'border-red-500/30 shadow-red-500/20'
              : 'border-indigo-500/30 shadow-indigo-500/20'
          }`}>
            
            {status === 'loading' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
                  <LoadingSpinner className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-indigo-400 mb-4 font-mono">
                  Confirmando Email...
                </h1>
                <p className="text-slate-300 font-mono">
                  Aguarde enquanto verificamos seu token
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-emerald-400 mb-2 font-mono">
                  Email Confirmado!
                </h1>
                
                <p className="text-emerald-300 mb-6 font-mono">
                  {message}
                </p>

                {userData && (
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                    <h3 className="text-indigo-400 font-mono font-bold mb-2">
                      🎉 Bem-vindo, {userData.username}!
                    </h3>
                    <p className="text-slate-300 text-sm font-mono">
                      Sua conta foi criada e você já pode fazer login
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <Link 
                    to="/login" 
                    className="block group relative py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-extrabold">FAZER LOGIN</span>
                    </div>
                  </Link>

                  <Link 
                    to="/register" 
                    className="block text-center text-indigo-400 hover:text-indigo-300 text-sm font-mono transition-colors"
                  >
                    Criar outra conta
                  </Link>
                </div>
              </div>
            )}

            {status === 'already-confirmed' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-amber-400 mb-2 font-mono">
                  Email Já Confirmado
                </h1>
                
                <p className="text-amber-300 mb-6 font-mono">
                  {message}
                </p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-amber-400 font-mono font-bold mb-2">
                    ✅ Sua conta já está ativa!
                  </h3>
                  <p className="text-slate-300 text-sm font-mono">
                    Você pode fazer login normalmente com suas credenciais
                  </p>
                </div>

                <div className="space-y-4">
                  <Link 
                    to="/login" 
                    className="block group relative py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-extrabold">FAZER LOGIN</span>
                    </div>
                  </Link>

                  <Link 
                    to="/register" 
                    className="block text-center text-indigo-400 hover:text-indigo-300 text-sm font-mono transition-colors"
                  >
                    Criar outra conta
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-red-400 mb-2 font-mono">
                  Erro na Confirmação
                </h1>
                
                <p className="text-red-300 mb-6 font-mono text-sm">
                  {message}
                </p>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <h4 className="text-red-400 font-mono font-bold mb-2">
                    🚨 Possíveis Causas:
                  </h4>
                  <ul className="text-red-300 text-sm font-mono space-y-1 text-left">
                    <li>• Token expirado (válido por 24h)</li>
                    <li>• Link já utilizado</li>
                    <li>• Email já confirmado</li>
                    <li>• Token inválido</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Link 
                    to="/register" 
                    className="block group relative py-3 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-extrabold">NOVO CADASTRO</span>
                    </div>
                  </Link>

                  <Link 
                    to="/login" 
                    className="block text-center text-indigo-400 hover:text-indigo-300 text-sm font-mono transition-colors"
                  >
                    Já tenho conta - Fazer login
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* System Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs font-mono">
              Sistema v2.1.3 • Confirmação de Email
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ConfirmEmailPage
