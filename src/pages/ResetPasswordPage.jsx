import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { passwordResetAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StableMatrixBackground from '../components/ui/StableMatrixBackground'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Token de redefinição não encontrado')
        navigate('/login')
        return
      }

      try {
        const response = await passwordResetAPI.verifyToken(token)
        setTokenValid(true)
        setUserInfo(response.data.data)
      } catch (error) {
        console.error('Token inválido:', error)
        toast.error('Link de redefinição inválido ou expirado')
        setTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token, navigate])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await passwordResetAPI.confirmReset({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword
      })
      
      toast.success('Senha redefinida com sucesso!')
      navigate('/login')
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast.error(error.response?.data?.message || 'Erro ao redefinir senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StableMatrixBackground />
        <div className="relative z-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-400">Verificando link de redefinição...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StableMatrixBackground />
        
        <div className="relative z-20 min-h-screen flex items-center justify-center section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Link Inválido</h1>
                <p className="text-slate-400 mb-6">
                  O link de redefinição de senha é inválido ou expirou.
                </p>
                
                <div className="space-y-3">
                  <Link
                    to="/forgot-password"
                    className="block w-full px-4 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all text-center"
                  >
                    Solicitar Novo Link
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 bg-slate-800 text-slate-400 rounded-xl font-semibold hover:bg-slate-700 transition-all text-center"
                  >
                    Voltar ao Login
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StableMatrixBackground />
      
      <div className="relative z-20 min-h-screen flex items-center justify-center section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-indigo-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Nova Senha</h1>
              {userInfo && (
                <p className="text-slate-400">
                  Olá, <span className="text-indigo-400">{userInfo.name}</span>! Digite sua nova senha.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-xs font-mono text-indigo-400 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número'
                      }
                    })}
                    className="w-full px-3 py-2.5 pr-10 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 font-mono">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-mono text-indigo-400 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: value => value === password || 'Senhas não coincidem'
                    })}
                    className="w-full px-3 py-2.5 pr-10 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 font-mono">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Redefinir Senha
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ← Voltar para o login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
