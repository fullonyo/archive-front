import React from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, GlobeAltIcon, ShieldCheckIcon, CpuChipIcon } from '@heroicons/react/24/outline'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 mt-auto">
      <div className="container-max section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="group inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <img 
                  src="/logo2.PNG" 
                  alt="VRCHIEVE" 
                  className="w-12 h-12 object-contain group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-300">
                  VRCHIEVE
                </span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Plataforma moderna e segura para compartilhamento de assets. 
              Conectando criadores e entusiastas em um ambiente colaborativo.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-slate-400 font-medium">Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">25+</div>
                <div className="text-xs text-slate-400 font-medium">Criadores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-slate-400 font-medium">Downloads</div>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Navegação
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                  Início
                </Link>
              </li>
              <li>
                <Link to="/categories" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/register" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                  Criar Conta
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos & Suporte */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Recursos & Suporte
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-400 hover:text-white transition-all duration-200">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Privacidade
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/vrchieve" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center text-slate-400 hover:text-white transition-all duration-200"
                >
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                  <span className="flex items-center">
                    Comunidade
                    <svg 
                      viewBox="0 0 71 55" 
                      className="w-3.5 h-3.5 ml-2 opacity-60 group-hover:opacity-100 transition-opacity"
                      fill="currentColor"
                    >
                      <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                    </svg>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider com gradiente */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-6 bg-slate-900">
              <CpuChipIcon className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <p className="text-slate-400 text-sm font-medium">
              © {currentYear} <span className="text-indigo-400 font-semibold">Archive Nyo</span>. Todos os direitos reservados.
            </p>
            <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
            <p className="text-slate-500 text-xs">
              Versão 2.1.3 • Sistema Atualizado
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-slate-400 text-sm">
              <span>Feito com</span>
              <HeartIcon className="w-4 h-4 text-pink-500 animate-pulse" />
              <span>para criadores</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full mx-3"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-xs font-medium">Sistema Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 