import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  CloudArrowUpIcon, 
  TagIcon, 
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  UserCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import FilePreview from './FilePreview'
import ImagePreview from './ImagePreview'
import TagInput from './TagInput'
import PlatformSelector from './PlatformSelector'
import CategorySelector from './CategorySelector'
import ExpandableTextarea from './ExpandableTextarea'
import { assetsAPI } from '../../services/api'

import { ComputerDesktopIcon, DevicePhoneMobileIcon, BoltIcon } from '@heroicons/react/24/outline'

const platforms = [
  { id: 'vrchat-pc', name: 'VRChat (PC)', icon: ComputerDesktopIcon },
  { id: 'vrchat-quest', name: 'VRChat (Quest)', icon: DevicePhoneMobileIcon },
  { id: 'vrchat-both', name: 'VRChat (Quest/PC)', icon: BoltIcon }
]

const unityVersions = [
  { id: '2019', name: 'Unity 2019' },
  { id: '2022', name: 'Unity 2022' }
]

const UploadForm = ({ onUploadSuccess = null }) => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    platforms: [],
    unityVersion: '',
    version: '',
    tags: [],
    externalLinks: [{ title: '', url: '' }],
    files: [],
    images: []
  })

  // Função para comprimir imagens
  const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar e comprimir
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            // Criar um novo File object com o blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Função para comprimir múltiplas imagens
  const compressImages = async (images) => {
    if (images.length === 0) return images
    
    setIsCompressing(true)
    setCompressionProgress(0)
    
    const compressedImages = []
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Só comprimir se for maior que 2MB
      if (image.size > 2 * 1024 * 1024) {
        console.log(`Comprimindo imagem ${i + 1}/${images.length}: ${image.name}`)
        const compressed = await compressImage(image)
        compressedImages.push(compressed)
        console.log(`Imagem comprimida: ${image.size} → ${compressed.size} bytes`)
      } else {
        compressedImages.push(image)
      }
      
      setCompressionProgress(Math.round(((i + 1) / images.length) * 100))
    }
    
    setIsCompressing(false)
    setCompressionProgress(0)
    
    return compressedImages
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [suggestions, setSuggestions] = useState({
    show: false,
    message: '',
    type: ''
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip', '.unitypackage'],
      'application/x-zip-compressed': ['.zip'],
      'application/octet-stream': ['.unitypackage']
    },
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles]
      }))

      // Sugestões baseadas nos arquivos
      if (acceptedFiles.some(file => file.name.toLowerCase().includes('quest'))) {
        setSuggestions({
          show: true,
          message: 'Detectamos arquivos Quest. Deseja adicionar Quest como plataforma compatível?',
          type: 'platform'
        })
      }
    }
  })

  const { 
    getRootProps: getImageRootProps, 
    getInputProps: getImageInputProps, 
    isDragActive: isImageDragActive 
  } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      if (formData.images.length + acceptedFiles.length > 5) {
        toast.error('Máximo de 5 imagens permitidas')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles]
      }))
    }
  })

  const steps = [
    {
      title: 'Informações Básicas',
      fields: ['title', 'category', 'description']
    },
    {
      title: 'Compatibilidade',
      fields: ['platforms', 'unityVersion', 'version']
    },
    {
      title: 'Arquivos',
      fields: ['files', 'images']
    },
    {
      title: 'Link Externo (Opcional)',
      fields: ['externalLinks']
    }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Sugestões baseadas nos inputs
    if (field === 'title' && value.toLowerCase().includes('avatar')) {
      setSuggestions({
        show: true,
        message: 'Parece que você está enviando um avatar. Deseja selecionar a categoria Avatar?',
        type: 'category'
      })
    }
  }

  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault()
    
    if (isUploading) return
    
    // As validações principais já foram feitas nas etapas anteriores
    // Aqui fazemos uma verificação final de segurança
    console.log('=== INICIANDO UPLOAD ===')
    console.log('Todos os dados foram validados nas etapas anteriores')
    
    // Verificação final
    if (!formData.files.length) {
      toast.error('Nenhum arquivo selecionado!')
      return
    }
    
    // Verificar limite de caracteres na descrição
    if (formData.description.length > 10000) {
      toast.error('Descrição muito longa! Máximo permitido: 10.000 caracteres.')
      return
    }
    
    console.log('Arquivo a ser enviado:', {
      name: formData.files[0].name,
      size: formData.files[0].size,
      type: formData.files[0].type,
      sizeInMB: (formData.files[0].size / (1024 * 1024)).toFixed(2)
    })
    
    // Verificar tamanho (1GB = 1073741824 bytes)
    const maxSize = 1073741824; // 1GB
    if (formData.files[0].size > maxSize) {
      toast.error(`Arquivo muito grande! Máximo permitido: 1GB. Seu arquivo: ${(formData.files[0].size / (1024 * 1024)).toFixed(2)}MB`)
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Comprimir imagens antes do upload se necessário
      let imagesToUpload = formData.images
      if (formData.images.length > 0) {
        console.log('=== COMPRIMINDO IMAGENS ===')
        toast.loading('Otimizando imagens...', { id: 'compression' })
        imagesToUpload = await compressImages(formData.images)
        toast.dismiss('compression')
        console.log('Imagens otimizadas com sucesso')
      }
      
      console.log('=== SENDING UPLOAD ===')
      console.log('Form data:', formData)
      console.log('Category being sent:', formData.category)
      console.log('Images to upload:', imagesToUpload.length)
      
      // Preparar dados para envio
      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('category_id', formData.category)
      
      // Adicionar link externo se fornecido
      if (formData.externalLinks[0]?.url && formData.externalLinks[0].url.trim()) {
        uploadData.append('external_url', formData.externalLinks[0].url.trim())
        console.log('Adding external URL:', formData.externalLinks[0].url.trim())
      }
      
      // Adicionar tags
      if (formData.tags.length > 0) {
        formData.tags.forEach(tag => {
          uploadData.append('tags', tag)
        })
      }
      
      // Adicionar arquivo principal
      if (formData.files[0]) {
        uploadData.append('file', formData.files[0])
      }
      
      // Adicionar imagens otimizadas (máximo 5)
      imagesToUpload.forEach((image, index) => {
        uploadData.append('images', image)
        console.log(`Adding optimized image ${index + 1}:`, image.name, `(${(image.size / 1024 / 1024).toFixed(2)}MB)`)
      })
      
      // Adicionar contador de imagens para validação
      uploadData.append('imageCount', imagesToUpload.length.toString())
      
      // Log do que estamos enviando
      console.log('FormData contents:')
      for (let pair of uploadData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]))
      }
      
      const response = await assetsAPI.uploadAsset(uploadData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Upload progress: ${percentCompleted}%`)
        setUploadProgress(percentCompleted)
      })
      
      if (response.data.success) {
        setUploadProgress(100)
        
        // Mostrar mensagem baseada no status de aprovação
        const { data } = response.data;
        const isAutoApproved = data.autoApproved;
        const userRole = data.userRole;
        
        // Chamar callback de sucesso se fornecida (antes das mensagens)
        if (onUploadSuccess) {
          onUploadSuccess(data.asset)
        }
        
        if (isAutoApproved) {
          toast.success(`🎉 Asset enviado e aprovado automaticamente! (${userRole})`, {
            duration: 5000,
          })
        } else {
          toast.success(`📋 Asset enviado com sucesso! Aguardando aprovação da moderação. (${userRole})`, {
            duration: 5000,
          })
        }
        
        // Esperar um pouco para mostrar 100% e depois redirecionar
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: isAutoApproved 
                ? 'Upload realizado e aprovado automaticamente! Seu asset já está disponível.'
                : 'Upload realizado com sucesso! Seu asset está aguardando aprovação da moderação.',
              uploadedAsset: data.asset,
              autoApproved: isAutoApproved,
              userRole: userRole
            }
          })
        }, 2000)
      } else {
        throw new Error(response.data.message || 'Erro no upload')
      }
      
    } catch (error) {
      console.error('=== UPLOAD ERROR DETAILS ===')
      console.error('Error object:', error)
      console.error('Response status:', error.response?.status)
      console.error('Response data:', error.response?.data)
      console.error('Response headers:', error.response?.headers)
      console.error('Request config:', error.config)
      
      let errorMessage = 'Erro ao enviar asset'
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Special handling for file type errors
      if (errorMessage.includes('not allowed')) {
        errorMessage = 'Tipo de arquivo não permitido. Use arquivos .zip, .unitypackage ou imagens.'
      }
      
      toast.error(errorMessage)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 placeholder-gray-500 transition-colors"
                placeholder="Nome do seu asset/avatar"
                required
              />
            </div>

            <CategorySelector
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
            />

            <ExpandableTextarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva seu asset/avatar detalhadamente..."
              maxLength={10000}
              required
              label="Descrição"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (máximo 5)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...formData.tags]
                          newTags.splice(index, 1)
                          handleInputChange('tags', newTags)
                        }}
                        className="ml-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                {formData.tags.length < 5 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicione uma tag..."
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 placeholder-gray-500 transition-colors"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim() && formData.tags.length < 5) {
                          e.preventDefault()
                          const newTag = e.target.value.trim().toLowerCase()
                          if (!formData.tags.includes(newTag)) {
                            handleInputChange('tags', [...formData.tags, newTag])
                            e.target.value = ''
                          }
                        }
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      {formData.tags.length}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <PlatformSelector
              platforms={platforms}
              selected={formData.platforms}
              onChange={(value) => handleInputChange('platforms', value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versão do Unity
              </label>
              <select
                value={formData.unityVersion}
                onChange={(e) => handleInputChange('unityVersion', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 transition-colors"
                required
              >
                <option value="" className="bg-gray-800">Selecione a versão...</option>
                {unityVersions.map(version => (
                  <option key={version.id} value={version.id} className="bg-gray-800">
                    {version.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versão do Asset
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 placeholder-gray-500 transition-colors"
                placeholder="Ex: v1.0.0"
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-12 text-center hover:border-indigo-500 transition-all cursor-pointer ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]' : 'border-gray-700/50 hover:scale-[1.01]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-300">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Arquivos suportados: .zip, .unitypackage, imagens
                </p>
              </div>
            </div>

            {formData.files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Arquivos ({formData.files.length})
                </h3>
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <FilePreview
                      key={index}
                      file={file}
                      onRemove={() => {
                        const newFiles = [...formData.files]
                        newFiles.splice(index, 1)
                        handleInputChange('files', newFiles)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dropzone separado para imagens */}
            <div {...getImageRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-purple-500 transition-all cursor-pointer ${
                isImageDragActive ? 'border-purple-500 bg-purple-500/10 scale-[0.99]' : 'border-gray-600/50 hover:scale-[1.01]'
              }`}
            >
              <input {...getImageInputProps()} />
              <div className="flex flex-col items-center">
                <PhotoIcon className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-300 text-sm">
                  Adicionar imagens/screenshots (máximo 5)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP
                </p>
                <span className="text-xs text-purple-400 mt-2">
                  {formData.images.length}/5 imagens
                </span>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Imagens ({formData.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <ImagePreview
                      key={index}
                      image={image}
                      onRemove={() => {
                        const newImages = [...formData.images]
                        newImages.splice(index, 1)
                        handleInputChange('images', newImages)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* Resumo do Upload */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-green-400 mr-2" />
                Revisar antes do envio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Título:</span>
                  <p className="text-white font-medium">{formData.title}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Categoria:</span>
                  <p className="text-white font-medium">{formData.category ? `ID: ${formData.category}` : 'Não selecionada'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Arquivos:</span>
                  <p className="text-white font-medium">{formData.files.length} arquivo(s)</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Imagens:</span>
                  <p className="text-white font-medium">{formData.images.length} imagem(ns)</p>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-gray-400">Descrição:</span>
                <p className="text-white text-sm mt-1 line-clamp-2">{formData.description}</p>
              </div>
            </div>

            {/* Link Externo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link Externo do Asset
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Opcional: Link para a página original do asset (Booth, Gumroad, etc)
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={formData.externalLinks[0]?.url || ''}
                    onChange={(e) => {
                      handleInputChange('externalLinks', [{
                        title: 'Link Externo',
                        url: e.target.value
                      }])
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Aviso importante */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-200 text-sm flex items-start">
                <span className="text-yellow-400 mr-2">⚠️</span>
                Seu asset será enviado para análise e aprovação. Você será notificado quando estiver disponível na plataforma.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-800/50">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStep 
                      ? 'bg-indigo-500 text-white' 
                      : index < currentStep 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400 mt-2 text-center">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.show && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-indigo-300">{suggestions.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSuggestions({ ...suggestions, show: false })}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300"
                  >
                    Ignorar
                  </button>
                  <button 
                    onClick={() => {
                      if (suggestions.type === 'platform') {
                        handleInputChange('platforms', [...formData.platforms, 'vrchat-quest'])
                      } else if (suggestions.type === 'category') {
                        handleInputChange('category', 'avatar')
                      }
                      setSuggestions({ ...suggestions, show: false })
                    }}
                    className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderFormStep()}
            </motion.div>
          </AnimatePresence>

          {/* Compression Progress Bar */}
          {isCompressing && compressionProgress > 0 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Otimizando imagens...</span>
                <span>{compressionProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-800/50 text-gray-500'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
              disabled={currentStep === 0}
            >
              Anterior
            </button>
            <button
              type={currentStep === steps.length - 1 ? 'submit' : 'button'}
              onClick={async () => {
                if (currentStep === steps.length - 1) {
                  // Esta é a última etapa - fazer upload
                  await handleSubmit()
                } else {
                  // Validar campos da etapa atual antes de avançar
                  if (currentStep === 0) {
                    // Validar etapa 1: Informações básicas
                    if (!formData.title.trim()) {
                      toast.error('Título é obrigatório')
                      return
                    }
                    if (!formData.category) {
                      toast.error('Categoria é obrigatória')
                      return
                    }
                    if (!formData.description.trim()) {
                      toast.error('Descrição é obrigatória')
                      return
                    }
                  } else if (currentStep === 2) {
                    // Validar etapa 3: Arquivos
                    if (formData.files.length === 0) {
                      toast.error('É necessário enviar pelo menos um arquivo')
                      return
                    }
                  }
                  
                  // Se chegou até aqui, pode avançar
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(prev => prev + 1)
                  }
                }
              }}
              disabled={isUploading || isCompressing}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isUploading || isCompressing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isCompressing
                ? `Otimizando... ${compressionProgress}%`
                : isUploading 
                  ? uploadProgress > 0 
                    ? `Enviando... ${uploadProgress}%`
                    : 'Preparando upload...'
                  : currentStep === steps.length - 1 
                    ? '🚀 Enviar Asset' 
                    : 'Próximo'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadForm
