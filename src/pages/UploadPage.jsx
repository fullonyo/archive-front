import React, { useState } from 'react'
import { motion } from 'framer-motion'
import UploadForm from '../components/upload/UploadForm'
import UserAssetsList from '../components/upload/UserAssetsList'

const UploadPage = () => {
  const [uploadTrigger, setUploadTrigger] = useState(0)

  // Função para notificar quando houver um novo upload
  const handleAssetUpload = () => {
    setUploadTrigger(prev => prev + 1)
  }

  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header with User Assets Button */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-10">
          <div className="text-center lg:text-left flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Upload de Assets
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 max-w-2xl lg:mx-0 mx-auto"
            >
              Compartilhe seus assets com a comunidade. Preencha todos os campos com atenção para 
              facilitar a busca e o uso por outros membros.
            </motion.p>
          </div>
          
          {/* Compact User Assets Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center lg:justify-end flex-shrink-0"
          >
            <UserAssetsList onAssetUpload={uploadTrigger} />
          </motion.div>
        </div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <UploadForm onUploadSuccess={handleAssetUpload} />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default UploadPage