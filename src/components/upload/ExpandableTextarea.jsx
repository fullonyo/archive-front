import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ExpandableTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  maxLength = 10000,
  required = false,
  label = "Descrição"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getColorClass = () => {
    if (value.length > maxLength) return 'bg-red-900/20 border-red-500/50';
    if (value.length > maxLength * 0.95) return 'bg-yellow-900/20 border-yellow-500/50';
    return 'bg-gray-800/50 border-gray-700/50';
  };
  
  const getStatusMessage = () => {
    if (value.length > maxLength) {
      return { text: '⚠️ Descrição muito longa! Reduza o texto.', color: 'text-red-400' };
    }
    if (value.length > maxLength * 0.95) {
      return { text: '⚠️ Próximo ao limite de caracteres.', color: 'text-yellow-400' };
    }
    return null;
  };
  
  const status = getStatusMessage();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
          <span className="text-xs text-gray-400 ml-2">
            ({value.length.toLocaleString()}/{maxLength.toLocaleString()} caracteres)
          </span>
        </label>
        
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-3 h-3" />
              Contrair
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-3 h-3" />
              Expandir
            </>
          )}
        </button>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e);
          }
        }}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-gray-100 placeholder-gray-500 transition-all duration-300 resize-y ${
          isExpanded ? 'h-64 min-h-64' : 'h-32 min-h-32'
        } max-h-96 ${getColorClass()}`}
        placeholder={placeholder}
        required={required}
      />
      
      {status && (
        <p className={`text-xs mt-1 ${status.color}`}>
          {status.text}
        </p>
      )}
      
      {/* Dicas para descrições longas */}
      {value.length > 1000 && (
        <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Dica:</strong> Para descrições muito longas, considere usar seções como:
          </p>
          <ul className="text-xs text-blue-300 mt-1 ml-4 list-disc">
            <li>📝 Descrição principal</li>
            <li>🔧 Requisitos técnicos</li>
            <li>📋 Instruções de instalação</li>
            <li>📞 Informações de contato</li>
            <li>📄 Termos de uso (em links externos)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpandableTextarea;
