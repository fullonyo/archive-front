import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const TagInput = ({ tags, onChange, suggestions = [] }) => {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input) {
      onChange(tags.slice(0, -1))
    }
  }

  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.toLowerCase().includes(input.toLowerCase()) &&
    !tags.includes(suggestion)
  )

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-indigo-500 transition-colors">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((_, i) => i !== index))}
                className="ml-1 text-indigo-400 hover:text-indigo-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-500 text-sm"
          placeholder="Adicionar tag..."
        />
      </div>

      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 py-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"
          >
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => {
                  if (!tags.includes(suggestion)) {
                    onChange([...tags, suggestion])
                  }
                  setInput('')
                  setShowSuggestions(false)
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TagInput
