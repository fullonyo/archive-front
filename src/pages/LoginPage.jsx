import React, { useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MatrixBackground = lazy(() => import('../components/ui/MatrixBackground'))

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      clearError()
      await login({ ...data, rememberMe })
      toast.success('Acesso autorizado!')
      navigate('/')
    } catch (error) {
      // Error is already handled by the auth context
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
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <MatrixBackground theme="vrchat" />
      </Suspense>

      {/* Login Container */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8 animate-slide-down relative z-30">
            <div className="inline-flex items-center justify-center mb-6 relative">
              <img 
                src="/logo.png" 
                alt="VRCHIEVE Logo" 
                className="w-56 h-56 object-contain hover:scale-105 transition-transform duration-300 relative z-10"
              />
            </div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent mx-auto" />
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-8 shadow-2xl shadow-indigo-500/20 animate-slide-up">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-mono text-indigo-400 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'E-mail inválido'
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                  placeholder="usuario@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 font-mono">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-mono text-indigo-400 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Senha é obrigatória'
                    })}
                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    placeholder="••••••••"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-indigo-400/70 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1 font-mono">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-indigo-500/30 bg-slate-800/50 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-mono text-indigo-300/80 hover:text-indigo-300 cursor-pointer transition-colors">
                    Lembrar de mim
                  </label>
                </div>
                <div className="ml-auto">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-mono text-indigo-400/70 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      <span className="text-white/90">CONECTANDO AO SISTEMA...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-2m-6-6h6" />
                      </svg>
                      <span className="text-white font-extrabold">ACESSAR SISTEMA</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-indigo-300/60 text-sm font-mono mb-4">
                Não possui credenciais de acesso?
              </p>
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-indigo-500/40 text-indigo-300 font-bold rounded-xl hover:from-indigo-500/20 hover:to-purple-500/20 hover:border-indigo-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
              >
                <svg className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-extrabold">SOLICITAR ACESSO</span>
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-6 text-center animate-fade-in-delayed">
            <p className="text-indigo-300/60 text-xs font-mono">
              Sistema v2.1.3 • Conexão segura
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 