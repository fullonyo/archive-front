/**
 * Utilitários para formatação de tempo
 */

/**
 * Calcula o tempo decorrido desde um timestamp específico e retorna em formato legível
 * @param {string|Date} timestamp - Timestamp ISO ou objeto Date
 * @returns {string} Tempo formatado (ex: "2h ago", "3d ago", "600d ago")
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = new Date();
  const past = new Date(timestamp);
  
  // Validar se a data é válida
  if (isNaN(past.getTime())) {
    return 'Invalid date';
  }
  
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  // Se for menos de 1 minuto
  if (diffSeconds < 60) {
    return 'Just now';
  }
  
  // Se for menos de 1 hora
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  
  // Se for menos de 1 dia
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  
  // Se for menos de 1 semana
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  // Se for menos de 1 mês
  if (diffDays < 30) {
    return `${diffWeeks}w ago`;
  }
  
  // Se for menos de 1 ano
  if (diffDays < 365) {
    return `${diffMonths}mo ago`;
  }
  
  // Mais de 1 ano
  return `${diffYears}y ago`;
};

/**
 * Calcula se um usuário está online recentemente (menos de 5 minutos offline)
 * @param {string} status - Status do usuário
 * @param {string|Date} lastLogin - Último login do usuário
 * @returns {boolean} Se o usuário está "recentemente online"
 */
export const isRecentlyOnline = (status, lastLogin) => {
  if (status !== 'offline') return false;
  if (!lastLogin) return false;
  
  const now = new Date();
  const past = new Date(lastLogin);
  const diffMs = now - past;
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  
  return diffMinutes <= 5;
};

/**
 * Formata data para exibição completa
 * @param {string|Date} timestamp - Timestamp ISO ou objeto Date
 * @returns {string} Data formatada (ex: "Dec 15, 2023 at 3:45 PM")
 */
export const formatFullDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Calcula o tempo de conta (tempo desde criação)
 * @param {string|Date} dateJoined - Data de criação da conta
 * @returns {string} Tempo da conta (ex: "2y 3mo", "5mo", "2w")
 */
export const getAccountAge = (dateJoined) => {
  if (!dateJoined) return 'Unknown';
  
  const now = new Date();
  const joined = new Date(dateJoined);
  
  if (isNaN(joined.getTime())) {
    return 'Invalid date';
  }
  
  const diffMs = now - joined;
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears > 0) {
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      return `${diffYears}y ${remainingMonths}mo`;
    }
    return `${diffYears}y`;
  }
  
  if (diffMonths > 0) {
    return `${diffMonths}mo`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks > 0) {
    return `${diffWeeks}w`;
  }
  
  return `${diffDays}d`;
};