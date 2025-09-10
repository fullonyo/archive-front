import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const Tag = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  removable = false, 
  onRemove,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium transition-all duration-200"
  
  const variants = {
    default: "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50",
    primary: "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30",
    secondary: "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30",
    success: "bg-green-600/20 text-green-300 hover:bg-green-600/30 border border-green-500/30",
    selected: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25",
    clickable: "bg-slate-700/50 text-slate-300 hover:bg-indigo-600/30 hover:text-indigo-200 cursor-pointer"
  }
  
  const sizes = {
    xs: "px-2 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-5 py-2.5 text-lg gap-2.5"
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  const handleClick = () => {
    if (onClick) onClick()
  }
  
  const handleRemove = (e) => {
    e.stopPropagation()
    if (onRemove) onRemove()
  }
  
  return (
    <span 
      className={classes}
      onClick={onClick ? handleClick : undefined}
      {...props}
    >
      <span className="truncate">{children}</span>
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 flex-shrink-0 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label="Remover tag"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

export default Tag
