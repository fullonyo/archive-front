import React, { useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api, { registrationAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StableMatrixBackground from '../components/ui/StableMatrixBackground'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestData, setRequestData] = useState(null)
  const [emailValidation, setEmailValidation] = useState({ 
    isChecking: false, 
    status: null, 
    message: '' 
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  // Função para verificar disponibilidade do email
  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) return

    setEmailValidation({ isChecking: true, status: null, message: '' })

    try {
      const response = await registrationAPI.checkEmailAvailability(email)
      const { available, status } = response.data

      if (available) {
        setEmailValidation({ 
          isChecking: false, 
          status: 'available', 
          message: '✓ Email disponível' 
        })
      } else {
        let message = ''
        switch (status) {
          case 'EMAIL_ALREADY_REGISTERED':
            message = '⚠️ Este email já está registrado'
            break
          case 'PENDING_CONFIRMATION':
            message = '⏳ Email aguardando confirmação'
            break
          case 'REGISTRATION_EXPIRED':
            message = '🔄 Registro expirado, pode registrar novamente'
            break
          default:
            message = '❌ Email não disponível'
        }
        
        setEmailValidation({ 
          isChecking: false, 
          status: 'unavailable', 
          message 
        })
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      setEmailValidation({ 
        isChecking: false, 
        status: 'error', 
        message: '❌ Erro ao verificar email' 
      })
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      console.log('📤 Enviando dados de registro:', data)
      
      const response = await registrationAPI.registerUser({
        nickname: data.name,
        email: data.email,
        discord: data.discord,
        password: data.password
      })

      console.log('✅ Registro enviado com sucesso:', response.data)
      
      // Salvar dados da solicitação para mostrar na confirmação
      setRequestData({
        id: response.data.data.id,
        nickname: data.name,
        email: data.email,
        discord: data.discord,
        message: response.data.message
      })
      
      setRequestSent(true)
      toast.success('Email de confirmação enviado!')
      
    } catch (error) {
      console.error('❌ Erro ao enviar registro:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
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

      {/* Matrix Background estável */}
      <StableMatrixBackground 
        stabilityDependencies={[requestSent, isSubmitting]}
        fallbackType="vrchat"
      />

      {/* Content - Conditional Rendering */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-4">
        {!requestSent ? (
          <RegisterForm 
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            watch={watch}
            errors={errors}
            isSubmitting={isSubmitting}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            password={password}
            emailValidation={emailValidation}
            checkEmailAvailability={checkEmailAvailability}
          />
        ) : (
          <ConfirmationScreen requestData={requestData} />
        )}
      </div>
    </div>
  )
}

// Componente do Formulário de Registro
const RegisterForm = ({ 
  onSubmit, 
  register, 
  handleSubmit, 
  watch, 
  errors, 
  isSubmitting, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword, 
  password,
  emailValidation,
  checkEmailAvailability
}) => (
  <div className="w-full max-w-lg animate-fade-in">
    {/* Logo - Compacto */}
    <div className="text-center mb-6 animate-slide-down relative z-30">
      <div className="inline-flex items-center justify-center mb-4 relative">
        <img 
          src="/logo.png" 
          alt="VRCHIEVE Logo" 
          className="w-40 h-40 object-contain hover:scale-105 transition-transform duration-300 relative z-10"
        />
      </div>
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent mx-auto" />
    </div>

    {/* Register Card */}
    <div className="bg-slate-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-6 shadow-2xl shadow-indigo-500/20 animate-slide-up">
      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome e Email - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-mono text-indigo-400 mb-1">
              Nickname
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Nickname é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres'
                }
              })}
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
              placeholder="Seu nickname"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-mono text-indigo-400 mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'E-mail inválido'
                }
              })}
              onBlur={(e) => checkEmailAvailability(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.email.message}</p>
            )}
            {/* Feedback de validação do email */}
            {emailValidation.isChecking && (
              <p className="text-blue-400 text-xs mt-1 font-mono">🔍 Verificando disponibilidade...</p>
            )}
            {emailValidation.message && !emailValidation.isChecking && (
              <p className={`text-xs mt-1 font-mono ${
                emailValidation.status === 'available' ? 'text-green-400' : 
                emailValidation.status === 'unavailable' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {emailValidation.message}
              </p>
            )}
          </div>
        </div>

        {/* Discord - Campo único */}
        <div>
          <label htmlFor="discord" className="flex items-center text-xs font-mono text-indigo-400 mb-1">
            <svg className="w-3 h-3 mr-1.5 text-[#5865F2]" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
            </svg>
            Discord
          </label>
          <div className="relative">
            <input
              type="text"
              id="discord"
              {...register('discord', {
                pattern: {
                  value: /^.{3,32}#[0-9]{4}$|^@?[a-zA-Z0-9._]{2,32}$/,
                  message: 'Formato: username#1234 ou @username'
                }
              })}
              className="w-full px-3 py-2.5 pl-10 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
              placeholder="@usuario"
            />
            <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-[#5865F2]/70">
              <svg className="w-4 h-4" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </svg>
            </div>
          </div>
          {errors.discord && (
            <p className="text-red-400 text-xs mt-1 font-mono">{errors.discord.message}</p>
          )}
        </div>

        {/* Senha e Confirmar Senha - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-xs font-mono text-indigo-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                })}
                className="w-full px-3 py-2.5 pr-10 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                placeholder="••••••••"
                style={{ 
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-indigo-400/70 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 transition-colors z-10"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-mono text-indigo-400 mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Confirmação obrigatória',
                  validate: value =>
                    value === password || 'Senhas não coincidem'
                })}
                className="w-full px-3 py-2.5 pr-10 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-slate-200 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                placeholder="••••••••"
                style={{ 
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-indigo-400/70 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 transition-colors z-10"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1 font-mono">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button - Compacto */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <div className="relative flex items-center justify-center">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                <span className="text-white/90">CRIANDO CONTA...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-white font-extrabold">CRIAR CONTA</span>
              </>
            )}
          </div>
        </button>
      </form>

      {/* Footer - Compacto */}
      <div className="mt-6 text-center">
        <p className="text-indigo-300/60 text-xs font-mono mb-3">
          Já possui credenciais?
        </p>
        <Link 
          to="/login" 
          className="group inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-indigo-500/40 text-indigo-300 font-bold rounded-lg hover:from-indigo-500/20 hover:to-purple-500/20 hover:border-indigo-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-mono tracking-wider text-xs transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
        >
          <svg className="w-3 h-3 mr-1.5 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="font-extrabold">FAZER LOGIN</span>
        </Link>
      </div>
    </div>

    {/* System Info - Compacto */}
    <div className="mt-4 text-center animate-fade-in-delayed">
      <p className="text-indigo-300/60 text-xs font-mono">
        Sistema v2.1.3 • Solicitação segura
      </p>
    </div>
  </div>
)

// Componente de Confirmação
const ConfirmationScreen = ({ requestData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl animate-fade-in"
    >
      {/* Logo - Confirmação */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-xl shadow-emerald-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-emerald-400 mb-2 tracking-wider font-mono">
          Conta Criada!
        </h1>
        <p className="text-emerald-300/80 text-lg font-mono">
          Confirme seu email para ativar a conta
        </p>
      </div>

      {/* Card de Confirmação */}
      <div className="bg-slate-900/90 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8 shadow-2xl shadow-emerald-500/20">
        {/* ID da Solicitação */}
        <div className="text-center mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <p className="text-emerald-300 text-sm font-mono mb-1">Registro Criado</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono tracking-wider">
            #{requestData?.id}
          </p>
        </div>

        {/* Resumo dos Dados */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-indigo-400 mb-4 font-mono border-b border-indigo-500/30 pb-2">
            📋 Dados da Conta
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-xs text-indigo-400 font-mono mb-1">Nickname</p>
              <p className="text-slate-200 font-mono">{requestData?.nickname}</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-xs text-indigo-400 font-mono mb-1">E-mail</p>
              <p className="text-slate-200 font-mono">{requestData?.email}</p>
            </div>

            {requestData?.discord && (
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-xs text-indigo-400 font-mono mb-1">Discord</p>
                <p className="text-slate-200 font-mono flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#5865F2]" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                  </svg>
                  {requestData.discord}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-400 font-mono font-bold mb-2">📧 Próximos Passos</h4>
              <ul className="text-blue-300 text-sm font-mono space-y-1">
                <li>• Enviamos um email de confirmação para você</li>
                <li>• Clique no link para ativar sua conta</li>
                <li>• O link expira em 24 horas</li>
                <li>• Após confirmar, você pode fazer login</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/login" 
            className="flex-1 group relative py-3 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="font-extrabold">IR PARA LOGIN</span>
            </div>
          </Link>

          <button 
            onClick={() => window.location.reload()}
            className="flex-1 group relative py-3 px-6 bg-gradient-to-r from-slate-700 to-slate-600 text-white font-bold rounded-xl hover:from-slate-600 hover:to-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-400/30 shadow-2xl shadow-slate-500/30 hover:shadow-slate-500/50 transition-all duration-300 font-mono tracking-wider text-sm transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden border border-slate-500/30"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-extrabold">REENVIAR EMAIL</span>
            </div>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-6 text-center">
        <p className="text-emerald-300/60 text-xs font-mono">
          ✅ Conta criada com sucesso • Sistema v2.1.3
        </p>
      </div>
    </motion.div>
  )
}

export default RegisterPage