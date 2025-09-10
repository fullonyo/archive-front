import React from 'react'
import { motion } from 'framer-motion'
import { LockClosedIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const licenseIcons = {
  'personal': LockClosedIcon,
  'commercial': CurrencyDollarIcon,
  'credits': UserGroupIcon
}

const licenseDescriptions = {
  'personal': 'Uso pessoal somente, sem redistribuição',
  'commercial': 'Permitido uso comercial com restrições',
  'credits': 'Uso livre com atribuição obrigatória'
}

const LicenseSelector = ({ licenses, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Licença de Uso
      </label>
      <div className="space-y-3">
        {licenses.map(license => {
          const Icon = licenseIcons[license.id]
          return (
            <motion.button
              key={license.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(license.id)}
              className={`w-full p-4 rounded-lg border ${
                value === license.id
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              } transition-colors text-left flex items-center space-x-4`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                value === license.id
                  ? 'bg-indigo-500/30'
                  : 'bg-gray-700/50'
              }`}>
                <Icon className={`w-6 h-6 ${
                  value === license.id
                    ? 'text-indigo-400'
                    : 'text-gray-400'
                }`} />
              </div>
              
              <div>
                <div className={`font-medium ${
                  value === license.id
                    ? 'text-indigo-300'
                    : 'text-gray-300'
                }`}>
                  {license.name}
                </div>
                <div className="text-sm text-gray-400">
                  {licenseDescriptions[license.id]}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default LicenseSelector
