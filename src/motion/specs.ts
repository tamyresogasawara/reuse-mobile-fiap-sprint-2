export const motionSpecs = {
  navigationTransition: { durationIOS: 280, easing: 'platform-default' },
  welcomeReveal: { duration: 620, delay: 80, easing: 'cubic-out', from: { opacity: 0, translateY: 18 }, midpoint: { opacity: 0.7, translateY: 5 }, to: { opacity: 1, translateY: 0 } },
  homeReveal: { duration: 520, delay: 100, easing: 'cubic-out', from: { opacity: 0, translateY: 16 }, midpoint: { opacity: 0.75, translateY: 4 }, to: { opacity: 1, translateY: 0 } },
  favoriteSpring: { delay: 0, easing: 'spring', outbound: { speed: 22, bounciness: 8 }, return: { speed: 20, bounciness: 5 }, from: { scale: 1 }, midpoint: { scale: 1.22 }, to: { scale: 1 } },
  progressFill: { duration: 700, delay: 120, easing: 'cubic-out', from: { width: 0 }, midpoint: { width: 0.72 }, to: { width: 1 } },
  publishCelebration: { duration: 560, delay: 0, easing: 'back-out', from: { opacity: 0, scale: 0.72, rotate: '-5deg' }, midpoint: { opacity: 1, scale: 1.08, rotate: '2deg' }, to: { opacity: 1, scale: 1, rotate: '0deg' } },
} as const;
