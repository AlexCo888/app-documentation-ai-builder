import type { DesignPattern, DesignCustomization } from '@/lib/types';

export type PatternOption = {
  value: DesignPattern;
  label: string;
  description: string;
  lightCustomization: DesignCustomization;
  darkCustomization: DesignCustomization;
};

export const patternOptions: PatternOption[] = [
  {
    value: 'minimal-modern',
    label: 'Minimal Modern',
    description: 'Clean, simple, focus on content',
    lightCustomization: {
      primaryColor: '#18181b',
      secondaryColor: '#ffffff',
      accentColor: '#6366f1',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 2,
      shadowBlur: 8,
      shadowSpread: 0,
      shadowColor: '#00000015'
    },
    darkCustomization: {
      primaryColor: '#ffffff',
      secondaryColor: '#18181b',
      accentColor: '#818cf8',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      shadowColor: '#00000040'
    }
  },
  {
    value: 'glassmorphism',
    label: 'Glassmorphism',
    description: 'Frosted glass, blur effects',
    lightCustomization: {
      primaryColor: '#6366f1',
      secondaryColor: '#ffffff',
      accentColor: '#8b5cf6',
      borderRadiusValue: 1,
      shadowXOffset: 0,
      shadowYOffset: 8,
      shadowBlur: 24,
      shadowSpread: 0,
      shadowColor: '#6366f130'
    },
    darkCustomization: {
      primaryColor: '#a5b4fc',
      secondaryColor: '#1e1b4b',
      accentColor: '#c4b5fd',
      borderRadiusValue: 1,
      shadowXOffset: 0,
      shadowYOffset: 8,
      shadowBlur: 32,
      shadowSpread: 0,
      shadowColor: '#6366f150'
    }
  },
  {
    value: 'neumorphism',
    label: 'Neumorphism',
    description: 'Soft shadows, embossed feel',
    lightCustomization: {
      primaryColor: '#334155',
      secondaryColor: '#e0e5ec',
      accentColor: '#5c6bc0',
      borderRadiusValue: 1,
      shadowXOffset: 8,
      shadowYOffset: 8,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#a3b1c650'
    },
    darkCustomization: {
      primaryColor: '#cbd5e1',
      secondaryColor: '#334155',
      accentColor: '#7c3aed',
      borderRadiusValue: 1,
      shadowXOffset: 8,
      shadowYOffset: 8,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#00000060'
    }
  },
  {
    value: 'brutalist',
    label: 'Brutalist',
    description: 'Bold borders, sharp edges',
    lightCustomization: {
      primaryColor: '#000000',
      secondaryColor: '#fde047',
      accentColor: '#ef4444',
      borderRadiusValue: 0,
      shadowXOffset: 4,
      shadowYOffset: 4,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowColor: '#000000'
    },
    darkCustomization: {
      primaryColor: '#fde047',
      secondaryColor: '#18181b',
      accentColor: '#fb7185',
      borderRadiusValue: 0,
      shadowXOffset: 4,
      shadowYOffset: 4,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowColor: '#fde047'
    }
  },
  {
    value: 'gradient-vibrant',
    label: 'Gradient Vibrant',
    description: 'Colorful gradients, energetic',
    lightCustomization: {
      primaryColor: '#a855f7',
      secondaryColor: '#fae8ff',
      accentColor: '#ec4899',
      borderRadiusValue: 0.75,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#a855f730'
    },
    darkCustomization: {
      primaryColor: '#c084fc',
      secondaryColor: '#581c87',
      accentColor: '#f472b6',
      borderRadiusValue: 0.75,
      shadowXOffset: 0,
      shadowYOffset: 6,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: '#a855f750'
    }
  },
  {
    value: 'soft-shadows',
    label: 'Soft Shadows',
    description: 'Gentle elevation, comfortable',
    lightCustomization: {
      primaryColor: '#1f2937',
      secondaryColor: '#ffffff',
      accentColor: '#3b82f6',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 16,
      shadowSpread: -2,
      shadowColor: '#00000020'
    },
    darkCustomization: {
      primaryColor: '#60a5fa',
      secondaryColor: '#1e293b',
      accentColor: '#3b82f6',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 6,
      shadowBlur: 20,
      shadowSpread: -2,
      shadowColor: '#00000050'
    }
  },
  {
    value: 'flat-minimal',
    label: 'Flat Minimal',
    description: 'No shadows, pure simplicity',
    lightCustomization: {
      primaryColor: '#3b82f6',
      secondaryColor: '#f9fafb',
      accentColor: '#10b981',
      borderRadiusValue: 0.375,
      shadowXOffset: 0,
      shadowYOffset: 0,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowColor: '#00000000'
    },
    darkCustomization: {
      primaryColor: '#60a5fa',
      secondaryColor: '#111827',
      accentColor: '#34d399',
      borderRadiusValue: 0.375,
      shadowXOffset: 0,
      shadowYOffset: 0,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowColor: '#00000000'
    }
  },
  {
    value: 'tech-dark',
    label: 'Tech Dark',
    description: 'Tech aesthetic, both themes',
    lightCustomization: {
      primaryColor: '#0e7490',
      secondaryColor: '#ffffff',
      accentColor: '#06b6d4',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#0e749020'
    },
    darkCustomization: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0f172a',
      accentColor: '#22d3ee',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 0,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: '#06b6d440'
    }
  },
  {
    value: 'elegant-light',
    label: 'Elegant Light',
    description: 'Airy, sophisticated',
    lightCustomization: {
      primaryColor: '#64748b',
      secondaryColor: '#f8fafc',
      accentColor: '#94a3b8',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 2,
      shadowBlur: 8,
      shadowSpread: 0,
      shadowColor: '#64748b15'
    },
    darkCustomization: {
      primaryColor: '#cbd5e1',
      secondaryColor: '#1e293b',
      accentColor: '#94a3b8',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      shadowColor: '#00000040'
    }
  },
  {
    value: 'playful-rounded',
    label: 'Playful Rounded',
    description: 'Friendly, approachable',
    lightCustomization: {
      primaryColor: '#a855f7',
      secondaryColor: '#fce7f3',
      accentColor: '#facc15',
      borderRadiusValue: 2,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      shadowColor: '#a855f725'
    },
    darkCustomization: {
      primaryColor: '#c084fc',
      secondaryColor: '#581c87',
      accentColor: '#fde047',
      borderRadiusValue: 2,
      shadowXOffset: 0,
      shadowYOffset: 6,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#00000050'
    }
  },
  {
    value: 'sharp-corporate',
    label: 'Sharp Corporate',
    description: 'Professional, business',
    lightCustomization: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#ffffff',
      accentColor: '#3b82f6',
      borderRadiusValue: 0.125,
      shadowXOffset: 0,
      shadowYOffset: 2,
      shadowBlur: 8,
      shadowSpread: 0,
      shadowColor: '#1e3a8a15'
    },
    darkCustomization: {
      primaryColor: '#60a5fa',
      secondaryColor: '#1e293b',
      accentColor: '#3b82f6',
      borderRadiusValue: 0.125,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      shadowColor: '#00000040'
    }
  },
  {
    value: 'artistic-bold',
    label: 'Artistic Bold',
    description: 'Expressive, creative',
    lightCustomization: {
      primaryColor: '#f97316',
      secondaryColor: '#fef3c7',
      accentColor: '#dc2626',
      borderRadiusValue: 0.75,
      shadowXOffset: 0,
      shadowYOffset: 6,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: '#f9731630'
    },
    darkCustomization: {
      primaryColor: '#fb923c',
      secondaryColor: '#431407',
      accentColor: '#f87171',
      borderRadiusValue: 0.75,
      shadowXOffset: 0,
      shadowYOffset: 8,
      shadowBlur: 24,
      shadowSpread: 0,
      shadowColor: '#00000050'
    }
  },
  {
    value: 'nature-organic',
    label: 'Nature Organic',
    description: 'Earthy tones, natural',
    lightCustomization: {
      primaryColor: '#059669',
      secondaryColor: '#d1fae5',
      accentColor: '#10b981',
      borderRadiusValue: 1,
      shadowXOffset: 0,
      shadowYOffset: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      shadowColor: '#05966920'
    },
    darkCustomization: {
      primaryColor: '#34d399',
      secondaryColor: '#064e3b',
      accentColor: '#10b981',
      borderRadiusValue: 1,
      shadowXOffset: 0,
      shadowYOffset: 6,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#00000040'
    }
  },
  {
    value: 'neon-cyber',
    label: 'Neon Cyber',
    description: 'Futuristic, glowing',
    lightCustomization: {
      primaryColor: '#ec4899',
      secondaryColor: '#fdf2f8',
      accentColor: '#a855f7',
      borderRadiusValue: 0.25,
      shadowXOffset: 0,
      shadowYOffset: 0,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: '#ec489930'
    },
    darkCustomization: {
      primaryColor: '#f472b6',
      secondaryColor: '#18181b',
      accentColor: '#c084fc',
      borderRadiusValue: 0.25,
      shadowXOffset: 0,
      shadowYOffset: 0,
      shadowBlur: 32,
      shadowSpread: 0,
      shadowColor: '#ec489980'
    }
  },
  {
    value: 'luxury-premium',
    label: 'Luxury Premium',
    description: 'Elegant, high-end',
    lightCustomization: {
      primaryColor: '#78350f',
      secondaryColor: '#fef3c7',
      accentColor: '#d97706',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 8,
      shadowBlur: 24,
      shadowSpread: 0,
      shadowColor: '#78350f30'
    },
    darkCustomization: {
      primaryColor: '#fbbf24',
      secondaryColor: '#1c1917',
      accentColor: '#d97706',
      borderRadiusValue: 0.5,
      shadowXOffset: 0,
      shadowYOffset: 12,
      shadowBlur: 32,
      shadowSpread: 0,
      shadowColor: '#00000060'
    }
  }
];
