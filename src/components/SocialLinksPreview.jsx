import React from 'react'

// Demonstração dos links sociais formatados
const SocialLinksPreview = () => {
  const exampleLinks = [
    'https://discord.com/channels/@me',
    'https://www.instagram.com/marquitod01/',
    'https://www.twitch.tv/marcos_9431',
    'https://open.spotify.com/user/marcos123',
    'https://twitter.com/marquito_vrc',
    'https://youtube.com/@marquitogamer',
    'https://steamcommunity.com/id/marquito',
    'https://github.com/marquito-dev',
    'https://tiktok.com/@marquito_drifter',
    'https://linkedin.com/in/marcos-silva',
    'https://reddit.com/u/marquito_gamer',
    'https://vrchat.com/home/user/usr_123456',
    'https://example.com/custom-link'
  ]

  // A mesma função que está no modal
  const formatSocialLink = (url) => {
    if (!url) return null

    const socialPlatforms = {
      'discord.com': {
        name: 'Discord',
        icon: '💬',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        displayName: 'Discord',
      },
      'discordapp.com': {
        name: 'Discord',
        icon: '💬',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        displayName: 'Discord',
      },
      'instagram.com': {
        name: 'Instagram',
        icon: '📷',
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        extractUsername: (url) => {
          const match = url.match(/instagram\.com\/([^/?]+)/)
          return match ? `@${match[1]}` : 'Instagram'
        }
      },
      'twitch.tv': {
        name: 'Twitch',
        icon: '📺',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        extractUsername: (url) => {
          const match = url.match(/twitch\.tv\/([^/?]+)/)
          return match ? `@${match[1]}` : 'Twitch'
        }
      },
      'youtube.com': {
        name: 'YouTube',
        icon: '📹',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        extractUsername: (url) => {
          const channelMatch = url.match(/youtube\.com\/@([^/?]+)/)
          return channelMatch ? `@${channelMatch[1]}` : 'YouTube'
        }
      },
      'twitter.com': {
        name: 'Twitter',
        icon: '🐦',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        extractUsername: (url) => {
          const match = url.match(/twitter\.com\/([^/?]+)/)
          return match ? `@${match[1]}` : 'Twitter'
        }
      },
      'open.spotify.com': {
        name: 'Spotify',
        icon: '🎵',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        extractUsername: (url) => {
          if (url.includes('/user/')) {
            const match = url.match(/user\/([^/?]+)/)
            return match ? `@${match[1]}` : 'Perfil Spotify'
          }
          return 'Spotify'
        }
      },
      'tiktok.com': {
        name: 'TikTok',
        icon: '🎵',
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        extractUsername: (url) => {
          const match = url.match(/tiktok\.com\/@([^/?]+)/)
          return match ? `@${match[1]}` : 'TikTok'
        }
      },
      'steamcommunity.com': {
        name: 'Steam',
        icon: '🎮',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        extractUsername: (url) => {
          const idMatch = url.match(/steamcommunity\.com\/id\/([^/?]+)/)
          return idMatch ? `@${idMatch[1]}` : 'Steam'
        }
      },
      'github.com': {
        name: 'GitHub',
        icon: '👨‍💻',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
        extractUsername: (url) => {
          const match = url.match(/github\.com\/([^/?]+)/)
          return match ? `@${match[1]}` : 'GitHub'
        }
      },
      'reddit.com': {
        name: 'Reddit',
        icon: '🤖',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        extractUsername: (url) => {
          const userMatch = url.match(/reddit\.com\/u\/([^/?]+)/)
          return userMatch ? `u/${userMatch[1]}` : 'Reddit'
        }
      },
      'linkedin.com': {
        name: 'LinkedIn',
        icon: '💼',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600/10',
        borderColor: 'border-blue-600/30',
        extractUsername: (url) => {
          const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
          return match ? `@${match[1]}` : 'LinkedIn'
        }
      },
      'vrchat.com': {
        name: 'VRChat',
        icon: '🥽',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        displayName: 'VRChat Profile'
      }
    }

    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    
    let platform = null
    for (const [key, value] of Object.entries(socialPlatforms)) {
      if (domain.includes(key)) {
        platform = { ...value, domain: key }
        break
      }
    }

    if (!platform) {
      platform = {
        name: 'Link Externo',
        icon: '🔗',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
        displayName: domain.length > 20 ? domain.substring(0, 20) + '...' : domain
      }
    }

    let displayName = platform.displayName
    if (platform.extractUsername) {
      displayName = platform.extractUsername(url)
    }
    if (!displayName) {
      displayName = platform.name
    }

    return {
      url,
      platform: platform.name,
      icon: platform.icon,
      displayName,
      color: platform.color,
      bgColor: platform.bgColor,
      borderColor: platform.borderColor
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg max-w-md">
      <h3 className="text-white font-semibold mb-4">🎨 Preview dos Links Sociais</h3>
      <div className="space-y-3">
        {exampleLinks.map((link, index) => {
          const socialLink = formatSocialLink(link)
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${socialLink.bgColor} ${socialLink.borderColor}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{socialLink.icon}</span>
                <div>
                  <p className={`font-medium ${socialLink.color}`}>{socialLink.displayName}</p>
                  <p className="text-xs text-gray-400">{socialLink.platform}</p>
                </div>
              </div>
              <svg className={`w-4 h-4 ${socialLink.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SocialLinksPreview
