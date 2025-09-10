import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  HomeIcon,
  RectangleStackIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import DefaultAvatar from '../ui/DefaultAvatar'
import Avatar from '../ui/Avatar'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { getGoogleDriveImageUrl, handleImageError } from '../../utils/googleDriveUtils'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout, canUpload } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout realizado com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('❌ Navbar: Logout error:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navigation = [
    { name: 'Início', href: '/', icon: HomeIcon },
    { name: 'Assets', href: '/marketplace', icon: RectangleStackIcon },
  ]

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: UserIcon },
    { name: 'Perfil', href: '/profile', icon: Cog6ToothIcon },
  ]

  if (canUpload()) {
    userNavigation.splice(1, 0, { name: 'Enviar Asset', href: '/upload', icon: PlusIcon })
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/5">
      <div className="container-max section-padding">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="group flex items-center space-x-3 text-xl font-bold text-white hover:text-indigo-400 transition-all duration-300"
            >
              <div className="relative">
                <img 
                  src="/logo2.PNG" 
                  alt="VRCHIEVE Logo" 
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-mono tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-300">
                  Archive Nyo
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Only for authenticated users */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent',
                      active 
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/50'
                    )}
                  >
                    <Icon className={clsx(
                      'w-4 h-4 transition-all duration-200',
                      active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Search Bar - Only for authenticated users */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Buscar assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </form>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Upload Button for Authenticated Users */}
                {canUpload() && (
                  <Link
                    to="/upload"
                    className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 border border-indigo-400/20"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Enviar</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="group flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-300 border border-transparent hover:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center ring-2 ring-slate-600/40 group-hover:ring-indigo-500/40 transition-all duration-300 overflow-hidden group-hover:scale-105">
                        <Avatar
                          avatarUrl={user?.avatar}
                          username={user?.username}
                          userId={user?.id}
                          size="md"
                          instanceId="navbar-button"
                          className="w-10 h-10"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm"></div>
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="font-semibold text-sm leading-tight">{user?.username}</span>
                      <span className="text-xs text-slate-400 leading-tight">{user?.accountType?.toLowerCase() || 'free'}</span>
                    </div>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95 translate-y-1"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 translate-y-1"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/30 z-50 overflow-hidden ring-1 ring-white/5">
                      {/* Header do dropdown */}
                      <div className="px-4 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center ring-2 ring-slate-600/40 overflow-hidden">
                              <Avatar
                                avatarUrl={user?.avatar}
                                username={user?.username}
                                userId={user?.id}
                                size="lg"
                                instanceId="navbar-dropdown"
                                className="w-12 h-12"
                              />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email || 'Usuário'}</p>
                            <div className="flex items-center mt-1">
                              <span className={clsx(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                user?.accountType === 'ADMIN' 
                                  ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30" 
                                  : user?.accountType === 'PREMIUM'
                                  ? "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30"
                                  : "bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30"
                              )}>
                                {user?.accountType?.toLowerCase() || 'free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        {userNavigation.map((item, index) => {
                          const Icon = item.icon
                          return (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={clsx(
                                    'group flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 mx-2 rounded-xl',
                                    active 
                                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10' 
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50'
                                  )}
                                >
                                  <div className={clsx(
                                    "p-2 rounded-lg transition-all duration-200",
                                    active 
                                      ? "bg-indigo-500/20 text-indigo-300" 
                                      : "bg-slate-700/40 text-slate-400 group-hover:bg-slate-600/60 group-hover:text-slate-300"
                                  )}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="flex-1">{item.name}</span>
                                  {index === 0 && (
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full opacity-75"></div>
                                  )}
                                </Link>
                              )}
                            </Menu.Item>
                          )
                        })}
                        
                        {/* Separator */}
                        <div className="my-2 mx-4 border-t border-slate-700/50"></div>
                        
                        {/* Logout button */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={clsx(
                                'group w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 mx-2 rounded-xl',
                                active 
                                  ? 'bg-red-500/15 text-red-300 border border-red-500/30' 
                                  : 'text-slate-300 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
                              )}
                            >
                              <div className={clsx(
                                "p-2 rounded-lg transition-all duration-200",
                                active 
                                  ? "bg-red-500/20 text-red-300" 
                                  : "bg-slate-700/40 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-300"
                              )}>
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              </div>
                              <span className="flex-1 text-left">Sair</span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600/50 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-slate-800/50"
                >
                  Entrar
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 border border-indigo-400/20"
                >
                  Cadastrar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 py-6 bg-slate-900/50 backdrop-blur-md rounded-b-xl mt-2 mx-4 border border-slate-700/30">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'nav-link',
                      isActive(item.href) && 'active'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {isAuthenticated && userNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'nav-link',
                      isActive(item.href) && 'active'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

    </nav>
  )
}

export default Navbar 