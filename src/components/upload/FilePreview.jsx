import React from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const FilePreview = ({ file, onRemove }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
          <DocumentIcon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200 truncate max-w-xs">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default FilePreview
