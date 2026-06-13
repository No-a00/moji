export type Theme = {
  id: string;
  name: string;
  gradientClass: string;
  colorHex: string; // for UI display
};

export const CHAT_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Mặc định',
    gradientClass: 'bg-gradient-to-br from-[#8b5cf6] to-[#ec4899]',
    colorHex: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradientClass: 'bg-gradient-to-br from-[#0ea5e9] to-[#2563eb]',
    colorHex: 'linear-gradient(135deg, #0ea5e9, #2563eb)'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    gradientClass: 'bg-gradient-to-br from-[#f97316] to-[#e11d48]',
    colorHex: 'linear-gradient(135deg, #f97316, #e11d48)'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    gradientClass: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
    colorHex: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    id: 'rose',
    name: 'Rose',
    gradientClass: 'bg-gradient-to-br from-[#fb7185] to-[#e11d48]',
    colorHex: 'linear-gradient(135deg, #fb7185, #e11d48)'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    gradientClass: 'bg-gradient-to-br from-[#475569] to-[#0f172a]',
    colorHex: 'linear-gradient(135deg, #475569, #0f172a)'
  },
  {
    id: 'mint',
    name: 'Mint',
    gradientClass: 'bg-gradient-to-br from-[#2dd4bf] to-[#0d9488]',
    colorHex: 'linear-gradient(135deg, #2dd4bf, #0d9488)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    gradientClass: 'bg-gradient-to-br from-[#fcd34d] via-[#ec4899] to-[#8b5cf6]',
    colorHex: 'linear-gradient(135deg, #fcd34d, #ec4899)'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    gradientClass: 'bg-gradient-to-br from-[#a78bfa] to-[#c084fc]',
    colorHex: 'linear-gradient(135deg, #a78bfa, #c084fc)'
  }
];

export const WALLPAPERS = [
  { id: 'default', name: 'Mặc định', url: '' },
  { id: 'solid-dark', name: 'Đen mờ', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop' },
  { id: 'anime-sky', name: 'Bầu trời', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop' },
  { id: 'nature', name: 'Thiên nhiên', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1920&auto=format&fit=crop' },
];

export const getThemeGradient = (themeId?: string) => {
  const theme = CHAT_THEMES.find((t) => t.id === themeId);
  return theme?.gradientClass || CHAT_THEMES[0].gradientClass;
};
