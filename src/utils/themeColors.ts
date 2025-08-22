export const themeColors = [
  { id: '1', gradient: ['#0891b2', '#0e7490'] }, // Default cyan
  { id: '2', gradient: ['#8b5cf6', '#7c3aed'] }, // Purple
  { id: '3', gradient: ['#f97316', '#ea580c'] }, // Orange
  { id: '4', gradient: ['#10b981', '#059669'] }, // Green
  { id: '5', gradient: ['#ec4899', '#be185d'] }, // Pink
  { id: '6', gradient: ['#6366f1', '#4f46e5'] }, // Indigo
];

export const getThemeColor = (themeColorId?: string) => {
  if (!themeColorId) return themeColors[0];
  return themeColors.find(c => c.id === themeColorId) || themeColors[0];
};