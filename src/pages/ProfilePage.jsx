import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CloudArrowUpIcon,
  HeartIcon,
  UserCircleIcon,
  PencilSquareIcon,
  LinkIcon,
  PhotoIcon,
  MapPinIcon,
  CalendarIcon,
  CheckBadgeIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  StarIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  CheckBadgeIcon as CheckBadgeSolidIcon 
} from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../services/api'
import DefaultAvatar from '../components/ui/DefaultAvatar'
import Avatar from '../components/ui/Avatar'
import AssetCard from '../components/assets/AssetCard'
import ProfileComments from '../components/ui/ProfileComments'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getGoogleDriveImageUrl, getGoogleDriveBannerUrl, handleImageError } from '../utils/googleDriveUtils'

// Componente de estatística moderna
const ModernStatCard = ({ icon: Icon, label, value, color = "indigo", trend = null }) => {
  // Mapeamento fixo de cores para evitar problemas com Tailwind CSS dinâmico
  const colorClasses = {
    indigo: {
      bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm",
      text: "text-indigo-400"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm",
      text: "text-pink-400"
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm",
      text: "text-emerald-400"
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm",
      text: "text-yellow-400"
    }
  }

  const colorConfig = colorClasses[color] || colorClasses.indigo

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorConfig.bg}`}>
          <Icon className={`w-6 h-6 ${colorConfig.text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-2">{value || '0'}</h3>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
      </div>
    </motion.div>
  )
}

// Componente de seção de perfil com melhor contraste
const ProfileHeader = ({ 
  userData, 
  isOwnProfile, 
  setIsEditing, 
  avatarInputRef, 
  bannerInputRef,
  handleAvatarUpload, 
  handleBannerUpload,
  isUploadingAvatar, 
  isUploadingBanner,
  avatarKey 
}) => {

  return (
  <div className="relative">
    {/* Cover/Banner customizável */}
    <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-8">
      {/* Banner do usuário ou gradiente padrão */}
      {userData.bannerUrl ? (
        <div className="absolute inset-0">
          <img
            src={getGoogleDriveBannerUrl(userData.bannerUrl)}
            alt="Banner do perfil"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Try alternative Google Drive URL formats
              const originalUrl = userData.bannerUrl;
              let fileId = null;
              
              if (originalUrl.includes('id=')) {
                fileId = originalUrl.split('id=')[1].split('&')[0];
              } else if (originalUrl.includes('/file/d/')) {
                fileId = originalUrl.split('/file/d/')[1].split('/')[0];
              }
              
              if (fileId && !e.target.dataset.retried) {
                e.target.dataset.retried = 'true';
                // Try standard export=view format
                const alternativeUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                e.target.src = alternativeUrl;
                return;
              }
              
              if (fileId && e.target.dataset.retried === 'true' && !e.target.dataset.secondRetry) {
                e.target.dataset.secondRetry = 'true';
                // Try download format
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                e.target.src = downloadUrl;
                return;
              }
              
              e.target.style.display = 'none';
              const fallbackDiv = e.target.parentElement.nextSibling;
              if (fallbackDiv) fallbackDiv.style.display = 'block';
            }}
          />
        </div>
      ) : null}
      
      {/* Gradiente de fundo padrão */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 ${userData.bannerUrl ? 'hidden' : 'block'}`}
        style={{ display: userData.bannerUrl ? 'none' : 'block' }}
      >
        {/* Padrão sutil */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-white/5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>
      
      {/* Overlay para garantir contraste de texto */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Gradient overlay na parte inferior para fade suave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      
      {/* Overlay de upload do banner */}
      <AnimatePresence>
        {isUploadingBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-10"
          >
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-indigo-400 border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm font-medium">Uploading banner...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ações do perfil (se próprio) */}
      {isOwnProfile && (
        <div className="absolute top-6 right-6 flex space-x-3">
          {/* Botão para trocar banner */}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => bannerInputRef.current?.click()}
            disabled={isUploadingBanner}
            className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 hover:bg-black/60 transition-all shadow-lg disabled:opacity-50"
            title="Alterar banner"
          >
            <PhotoIcon className="w-5 h-5 text-white drop-shadow-lg" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 hover:bg-black/60 transition-all shadow-lg"
          >
            <PencilSquareIcon className="w-5 h-5 text-white drop-shadow-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 hover:bg-black/60 transition-all shadow-lg"
          >
            <ShareIcon className="w-5 h-5 text-white drop-shadow-lg" />
          </motion.button>
        </div>
      )}
    </div>

    {/* Informações principais do perfil com melhor contraste */}
    <div className="relative -mt-32 px-6 sm:px-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-end mb-8">
        {/* Avatar com sombra mais forte */}
        <div className="relative mb-6 sm:mb-0 sm:mr-8">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-900 bg-gray-800 shadow-2xl ring-4 ring-black/50">
            <Avatar
              avatarUrl={userData.avatar}
              username={userData.username}
              userId={userData.id}
              size="2xl"
              instanceId="profile-page"
              className="w-full h-full"
            />
          </div>
          
          {/* Upload overlay */}
          <AnimatePresence>
            {isUploadingAvatar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center backdrop-blur-sm"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-400 border-t-transparent"></div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Avatar controls */}
          {isOwnProfile && (
            <div className="absolute -bottom-2 -right-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="p-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg ring-2 ring-black/20"
              >
                <PhotoIcon className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Informações do usuário com fundo semitransparente */}
        <div className="flex-1 text-center sm:text-left relative">
          {/* Fundo semitransparente atrás do texto para melhor legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent rounded-2xl backdrop-blur-sm -m-4 p-4"></div>
          <div className="relative z-10">
            <ProfileInfo userData={userData} />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

// Componente minimalista do modal de edição otimizado
const EditProfileModal = ({ isOpen, formData, handleInputChange, handleEditProfile, setIsEditing }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsEditing(false)
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-gray-900/98 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header compacto */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <PencilSquareIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(false)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Formulário otimizado */}
          <form onSubmit={handleEditProfile} className="overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="p-4 space-y-6">
              {/* Informações básicas - layout compacto */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center">
                  <UserCircleIcon className="w-4 h-4 mr-2 text-indigo-400" />
                  INFORMAÇÕES BÁSICAS
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Nome de usuário"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      placeholder="Biografia (opcional)"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-indigo-400" />
                  LOCALIZAÇÃO
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="País"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Cidade"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Redes sociais - grid otimizado */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2 text-indigo-400" />
                  REDES SOCIAIS
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Discord */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5865F2]" viewBox="0 0 71 55" fill="currentColor">
                      <g clipPath="url(#clip0)">
                        <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                      </g>
                    </svg>
                    <input
                      type="text"
                      value={formData.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      placeholder="username#1234"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#5865F2] focus:border-[#5865F2] transition-all text-sm"
                    />
                  </div>

                  {/* Twitter */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] transition-all text-sm"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#E4405F] focus:border-[#E4405F] transition-all text-sm"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <input
                      type="text"
                      value={formData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="@username"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] transition-all text-sm"
                    />
                  </div>

                  {/* Spotify */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <input
                      type="text"
                      value={formData.spotify || ''}
                      onChange={(e) => handleInputChange('spotify', e.target.value)}
                      placeholder="Username/URL"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#1DB954] focus:border-[#1DB954] transition-all text-sm"
                    />
                  </div>

                  {/* VRChat */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1f9cfd]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <input
                      type="text"
                      value={formData.vrchat || ''}
                      onChange={(e) => handleInputChange('vrchat', e.target.value)}
                      placeholder="Username"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#1f9cfd] focus:border-[#1f9cfd] transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-2 p-4 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all text-sm"
              >
                Salvar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all text-sm"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

// Componente de informações do perfil
// Componente de informações do perfil com design limpo
const ProfileInfo = ({ userData }) => (
  <div className="space-y-6">
    {/* Nome e verificação com sombra de texto */}
    <div>
      <div className="flex items-center justify-center sm:justify-start mb-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mr-3 drop-shadow-lg [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
          {userData.username}
        </h1>
        <CheckBadgeSolidIcon className="w-7 h-7 text-indigo-400 drop-shadow-lg" />
      </div>
      
      {/* Meta info sem fundo individual */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-gray-200 text-sm mb-4">
        <div className="flex items-center space-x-1.5">
          <MapPinIcon className="w-4 h-4 text-gray-300 drop-shadow" />
          <span className="font-medium drop-shadow [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]">
            {userData.city && userData.country 
              ? `${userData.city}, ${userData.country}`
              : userData.country 
                ? userData.country
                : userData.city 
                  ? userData.city
                  : 'Localização não informada'
            }
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CalendarIcon className="w-4 h-4 text-gray-300 drop-shadow" />
          <span className="font-medium drop-shadow [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]">Membro desde 2024</span>
        </div>
      </div>
      
      {userData.bio && (
        <p className="text-gray-100 text-lg leading-relaxed text-center sm:text-left max-w-2xl font-medium drop-shadow [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]">
          {userData.bio}
        </p>
      )}
    </div>
    
    {/* Links sociais minimalistas com design limpo */}
    {(userData.socialLinks?.discord || userData.socialLinks?.twitter || userData.socialLinks?.instagram || userData.socialLinks?.youtube || userData.socialLinks?.spotify || userData.socialLinks?.vrchat) && (
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {userData.socialLinks?.discord && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2.5 bg-[#5865F2]/15 border border-[#5865F2]/30 rounded-xl text-[#5865F2] hover:bg-[#5865F2]/25 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
            title={`Discord: ${userData.socialLinks.discord}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 71 55" fill="currentColor">
              <g clipPath="url(#clip0)">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </g>
            </svg>
          </motion.div>
        )}
        
        {userData.socialLinks?.twitter && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            href={`https://twitter.com/${userData.socialLinks.twitter.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#1DA1F2]/15 border border-[#1DA1F2]/30 rounded-xl text-[#1DA1F2] hover:bg-[#1DA1F2]/25 transition-all backdrop-blur-sm shadow-lg"
            title={`Twitter: ${userData.socialLinks.twitter}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </motion.a>
        )}
        
        {userData.socialLinks?.instagram && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            href={`https://instagram.com/${userData.socialLinks.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#E4405F]/15 border border-[#E4405F]/30 rounded-xl text-[#E4405F] hover:bg-[#E4405F]/25 transition-all backdrop-blur-sm shadow-lg"
            title={`Instagram: ${userData.socialLinks.instagram}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </motion.a>
        )}
        
        {userData.socialLinks?.youtube && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            href={`https://youtube.com/@${userData.socialLinks.youtube.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#FF0000]/15 border border-[#FF0000]/30 rounded-xl text-[#FF0000] hover:bg-[#FF0000]/25 transition-all backdrop-blur-sm shadow-lg"
            title={`YouTube: ${userData.socialLinks.youtube}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </motion.a>
        )}

        {userData.socialLinks?.spotify && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            href={userData.socialLinks.spotify.includes('http') ? userData.socialLinks.spotify : `https://open.spotify.com/user/${userData.socialLinks.spotify}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#1DB954]/15 border border-[#1DB954]/30 rounded-xl text-[#1DB954] hover:bg-[#1DB954]/25 transition-all backdrop-blur-sm shadow-lg"
            title={`Spotify: ${userData.socialLinks.spotify}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </motion.a>
        )}

        {userData.socialLinks?.vrchat && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2.5 bg-[#1f9cfd]/15 border border-[#1f9cfd]/30 rounded-xl text-[#1f9cfd] hover:bg-[#1f9cfd]/25 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
            title={`VRChat: ${userData.socialLinks.vrchat}`}
          >
            <svg className="w-5 h-5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </motion.div>
        )}
      </div>
    )}
  </div>
)

const ProfilePage = () => {
  const { id } = useParams()
  const { user: currentUser, updateUser } = useAuth()
  
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const lastSyncedAvatarRef = useRef(null) // Para evitar loops infinitos de sincronização
  const [activeTab, setActiveTab] = useState('uploads')
  const [isTabLoading, setIsTabLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [avatarKey, setAvatarKey] = useState(Date.now())
  const [userData, setUserData] = useState(null)
  const [userAssets, setUserAssets] = useState({ uploads: [], favorites: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    country: '',
    city: '',
    discord: '',
    twitter: '',
    instagram: '',
    youtube: '',
    spotify: '',
    vrchat: ''
  })

  const isOwnProfile = !id || id === currentUser?.id?.toString() || (userData && currentUser && userData.id === currentUser.id)

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        if (id && id !== currentUser?.id?.toString()) {
          // Buscando dados de outro usuário específico
          const response = await usersAPI.getUserById(id)
          if (response?.data?.data) {
            setUserData(response.data.data)
          }
        } else if (currentUser) {
          // Para o próprio perfil, usar dados do contexto primeiro
          try {
            const response = await usersAPI.getProfile()
            if (response?.data?.data?.user) {
              setUserData(response.data.data.user)
            } else {
              throw new Error('Invalid API response format')
            }
          } catch (apiError) {
            console.warn('API fetch failed, falling back to context data:', apiError)
            // Fallback para dados do contexto se a API falhar
            if (currentUser) {
              setUserData(currentUser)
            } else {
              throw new Error('No user data available')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Erro ao carregar dados do usuário')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id]) // Simplificar dependências para evitar loops

  // Sincronizar userData quando avatar do currentUser for atualizado
  useEffect(() => {
    // DESABILITADA - estava causando loops infinitos
    // Apenas sincronizar após upload de avatar, não em toda mudança
    
    /* Effect desabilitado para evitar loops infinitos
    if (isOwnProfile && 
        currentUser?.avatar && 
        userData?.avatar && 
        currentUser.avatar !== userData.avatar &&
        currentUser.avatar !== lastSyncedAvatarRef.current) {
      
      lastSyncedAvatarRef.current = currentUser.avatar
      
      setUserData(prev => {
        const updated = {
          ...prev,
          avatar: currentUser.avatar
        }
        return updated
      })
      setAvatarKey(Date.now())
    }
    */
  }, [currentUser?.avatar, isOwnProfile, userData?.avatar])

  // Atualizar formData quando userData mudar
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        bio: userData.bio || '',
        country: userData.country || '',
        city: userData.city || '',
        discord: userData.socialLinks?.discord || '',
        twitter: userData.socialLinks?.twitter || '',
        instagram: userData.socialLinks?.instagram || '',
        youtube: userData.socialLinks?.youtube || '',
        spotify: userData.socialLinks?.spotify || '',
        vrchat: userData.socialLinks?.vrchat || ''
      })
    }
  }, [userData])

  // Buscar assets do usuário
  useEffect(() => {
    const fetchUserAssets = async () => {
      if (!userData) {
        return
      }

      try {
        const [uploadsResponse, favoritesResponse] = await Promise.all([
          usersAPI.getUserAssets({ userId: userData.id }),
          usersAPI.getFavorites({ userId: userData.id })
        ])

        const favoriteAssets = favoritesResponse.data.data?.favorites?.map(fav => fav.asset) || [];
        const uploadsAssets = uploadsResponse.data.data?.assets || [];

        setUserAssets({
          uploads: uploadsAssets,
          favorites: favoriteAssets
        })
      } catch (err) {
        console.error('Error fetching user assets:', err)
        // Set empty arrays on error to avoid undefined issues
        setUserAssets({
          uploads: [],
          favorites: []
        })
      }
    }

    fetchUserAssets()
  }, [userData])

  // Função para forçar sincronização do avatar
  const forceAvatarSync = (newAvatarUrl) => {
    // Update the ref to prevent sync loops
    lastSyncedAvatarRef.current = newAvatarUrl
    
    // Update local state immediately
    setUserData(prev => {
      const updated = prev ? {
        ...prev,
        avatar: newAvatarUrl
      } : prev
      return updated
    })
    
    // Force avatar key update to trigger re-render
    setAvatarKey(Date.now())
    
    // Update context if it's own profile
    if (isOwnProfile && updateUser && currentUser) {
      const updatedUser = {
        ...currentUser,
        avatar: newAvatarUrl
      }
      
      updateUser(updatedUser)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const response = await usersAPI.uploadAvatar(file)
      
      if (response.data.success) {
        const newAvatarUrl = response.data.data.avatar_url
        
        // Force avatar sync across all components
        forceAvatarSync(newAvatarUrl)
        
        toast.success('Foto de perfil atualizada!')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao fazer upload da imagem'
      toast.error(errorMessage)
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handleBannerUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB')
      return
    }

    setIsUploadingBanner(true)

    try {
      const response = await usersAPI.uploadBanner(file)
      
      if (response.data.success) {
        const newBannerUrl = response.data.data.banner_url
        
        // Update user data with new banner
        setUserData(prev => {
          return {
            ...prev,
            bannerUrl: newBannerUrl
          }
        })
        
        // Update context if it's own profile
        if (isOwnProfile && updateUser && currentUser) {
          updateUser({ ...currentUser, bannerUrl: newBannerUrl })
        }
        
        toast.success('Banner atualizado com sucesso!')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer upload do banner'
      toast.error(errorMessage)
    } finally {
      setIsUploadingBanner(false)
      if (bannerInputRef.current) {
        bannerInputRef.current.value = ''
      }
    }
  }

  const handleEditProfile = async (e) => {
    e.preventDefault()
    
    try {
      const updateData = {
        username: formData.username,
        bio: formData.bio,
        country: formData.country,
        city: formData.city,
        socialLinks: {
          discord: formData.discord,
          twitter: formData.twitter,
          instagram: formData.instagram,
          youtube: formData.youtube,
          spotify: formData.spotify,
          vrchat: formData.vrchat
        }
      }

      const response = await usersAPI.updateProfile(updateData)
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          ...updateData,
          socialLinks: updateData.socialLinks
        }))
        
        if (isOwnProfile && updateUser) {
          updateUser({
            ...currentUser,
            username: updateData.username,
            bio: updateData.bio
          })
        }
        
        setIsEditing(false)
        toast.success('Perfil atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil'
      toast.error(errorMessage)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setIsTabLoading(true)
      setActiveTab(newTab)
      
      // Simular um pequeno delay para mostrar o loading
      setTimeout(() => {
        setIsTabLoading(false)
      }, 300)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto pt-24 px-6">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="h-64 bg-white/5 rounded-3xl"></div>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-white/5 rounded-3xl"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-white/5 rounded w-1/3"></div>
                <div className="h-4 bg-white/5 rounded w-2/3"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Usuário não encontrado</h2>
          <p className="text-gray-400 mb-6">{error || 'O usuário solicitado não existe.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all"
          >
            Voltar ao início
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-12">
      {/* Container principal */}
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header do perfil */}
        <ProfileHeader
          userData={userData}
          isOwnProfile={isOwnProfile}
          setIsEditing={setIsEditing}
          avatarInputRef={avatarInputRef}
          bannerInputRef={bannerInputRef}
          handleAvatarUpload={handleAvatarUpload}
          handleBannerUpload={handleBannerUpload}
          isUploadingAvatar={isUploadingAvatar}
          isUploadingBanner={isUploadingBanner}
          avatarKey={avatarKey}
        />

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
            <ModernStatCard
              icon={CloudArrowUpIcon}
              label="Assets publicados"
              value={userData.stats?.totalUploads || 0}
              color="indigo"
              trend={12}
            />
            <ModernStatCard
              icon={HeartIcon}
              label="Curtidas recebidas"
              value={userData.stats?.totalFavorites || 0}
              color="pink"
              trend={8}
            />
            <ModernStatCard
              icon={ArrowDownTrayIcon}
              label="Downloads totais"
              value={userData.stats?.totalDownloads || 0}
              color="emerald"
              trend={15}
            />
            <ModernStatCard
              icon={StarIcon}
              label="Avaliação média"
              value="4.9"
              color="yellow"
              trend={3}
            />
          </motion.div>

        {/* Seção de conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden"
        >
          {/* Navegação de abas */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <h2 className="text-2xl font-bold text-white">Espaço Pessoal</h2>
              
              <div className="flex bg-white/5 rounded-2xl p-1 backdrop-blur-sm">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange('uploads')}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'uploads'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>Uploads ({userAssets.uploads.length})</span>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange('favorites')}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="w-4 h-4" />
                    <span>Itens Curtidos ({userAssets.favorites.length})</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange('comments')}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'comments'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Comentários</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Conteúdo das abas */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isTabLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === 'comments' ? (
                    // Skeleton específico para comentários
                    <div className="space-y-6">
                      {/* Comment Form Skeleton */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-2xl"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-20 bg-white/10 rounded-xl"></div>
                            <div className="flex justify-between items-center">
                              <div className="h-3 bg-white/10 rounded w-24"></div>
                              <div className="h-8 bg-white/10 rounded-xl w-24"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comments List Skeleton */}
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="h-4 bg-white/10 rounded w-24"></div>
                                  <div className="h-3 bg-white/10 rounded w-16 ml-auto"></div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-3 bg-white/10 rounded w-full"></div>
                                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                </div>
                              </div>
                              <div className="mt-3 ml-1 flex gap-2">
                                <div className="h-7 bg-white/5 rounded-full w-16"></div>
                                <div className="h-7 bg-white/5 rounded-full w-20"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Skeleton para assets (uploads e curtidos)
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                            <div className="aspect-[4/3] bg-white/10"></div>
                            <div className="p-4 space-y-3">
                              <div className="h-5 bg-white/10 rounded w-3/4"></div>
                              <div className="h-4 bg-white/10 rounded w-full"></div>
                              <div className="h-4 bg-white/10 rounded w-2/3"></div>
                              <div className="flex justify-between items-center pt-2">
                                <div className="h-4 bg-white/10 rounded w-16"></div>
                                <div className="h-4 bg-white/10 rounded w-12"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'comments' ? (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileComments profileUserId={id ? parseInt(id) : (userData?.id || null)} />
                </motion.div>
              ) : userAssets[activeTab] && userAssets[activeTab].length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {userAssets[activeTab].map((asset, index) => (
                    <AssetCard key={asset.id} asset={asset} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${activeTab}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    {activeTab === 'uploads' ? (
                      <CloudArrowUpIcon className="w-12 h-12 text-gray-500" />
                    ) : activeTab === 'favorites' ? (
                      <HeartIcon className="w-12 h-12 text-gray-500" />
                    ) : (
                      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-3">
                    {activeTab === 'uploads' 
                      ? 'Nenhum upload ainda' 
                      : activeTab === 'favorites'
                        ? 'Nenhum item curtido ainda'
                        : 'Nenhum comentário ainda'
                    }
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    {activeTab === 'uploads' 
                      ? isOwnProfile 
                        ? 'Que tal compartilhar seu primeiro asset com a comunidade?' 
                        : 'Este usuário ainda não publicou nenhum asset.'
                      : activeTab === 'favorites'
                        ? isOwnProfile
                          ? 'Explore nossa biblioteca e curta seus assets preferidos.'
                          : 'Este usuário ainda não curtiu nenhum asset.'
                        : 'Seja o primeiro a deixar um comentário!'
                    }
                  </p>
                  {isOwnProfile && activeTab === 'uploads' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-8"
                    >
                      <Link
                        to="/upload"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
                      >
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        Fazer primeiro upload
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modal de edição */}
        <EditProfileModal
          isOpen={isEditing}
          formData={formData}
          handleInputChange={handleInputChange}
          handleEditProfile={handleEditProfile}
          setIsEditing={setIsEditing}
        />
      </div>
    </div>
  )
}

export default ProfilePage 