import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    let receivedEvent = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !receivedEvent) setReducedMotion(enabled);
    }).catch(() => {
      if (active && !receivedEvent) setReducedMotion(true);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      receivedEvent = true;
      setReducedMotion(enabled);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}
