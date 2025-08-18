// Base unit: 4px
const base = 4;

export const spacing = {
  xs: base,        // 4px - Tight spacing
  sm: base * 2,    // 8px - Small elements
  md: base * 4,    // 16px - Standard spacing
  lg: base * 6,    // 24px - Section spacing
  xl: base * 8,    // 32px - Large sections
  xxl: base * 12,  // 48px - Major sections
};

// Component-specific spacing
export const componentSpacing = {
  // Card spacing
  card: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  
  // Button spacing
  button: {
    paddingVertical: spacing.sm * 1.5, // 12px
    paddingHorizontal: spacing.md + spacing.xs, // 20px
    gap: spacing.sm,
  },
  
  // Screen padding
  screen: {
    paddingHorizontal: spacing.md + spacing.xs, // 20px
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  
  // List item spacing
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  
  // Section spacing
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  
  // Form spacing
  form: {
    gap: spacing.md,
    inputSpacing: spacing.sm * 1.5, // 12px
  },
};