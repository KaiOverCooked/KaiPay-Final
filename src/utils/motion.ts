import { Transition, Variants } from 'motion/react';

// iOS Spring Physics Configuration
export const iosSpringTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
  mass: 0.8,
};

export const iosSheetTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

export const iosQuickTap = {
  scale: 0.96,
  transition: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
  },
};

export const iosSubtleTap = {
  scale: 0.98,
  transition: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 30,
  },
};

// Tab Transition Variants (Slide & Spring)
export const iosTabVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
    scale: 0.99,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: iosSpringTransition,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    scale: 0.99,
    transition: { duration: 0.15, ease: 'easeOut' },
  }),
};

// Bottom Sheet Variants (iOS slide up)
export const iosSheetVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: iosSheetTransition,
  },
  exit: {
    opacity: 0,
    y: '100%',
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

// Backdrop Dimming
export const iosBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// Dynamic Island / Push Banner Notification Variants
export const iosToastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -40,
    scale: 0.88,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 450,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.92,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};
