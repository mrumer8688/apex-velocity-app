/**
 * Haptic / Vibration feedback manager for mobile devices
 * Triggers tactile vibration patterns for 3D visualizers, test drive confirmations,
 * and engine ignition / rev events.
 */

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'orbit'
  | 'colorChange'
  | 'ignition'
  | 'rev'
  | 'success';

export const triggerHaptic = (type: HapticType = 'selection') => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        // Quick 12ms tap for clicks & options
        navigator.vibrate(12);
        break;

      case 'orbit':
        // Subtle haptic tick for 3D visualizer rotation
        navigator.vibrate(16);
        break;

      case 'colorChange':
        // Double-tick for paint / wheel customization
        navigator.vibrate([15, 30, 20]);
        break;

      case 'medium':
        navigator.vibrate(30);
        break;

      case 'heavy':
        navigator.vibrate(60);
        break;

      case 'ignition':
        // Starter motor crank and combustion kick
        navigator.vibrate([35, 45, 55, 40, 110, 50, 75]);
        break;

      case 'rev':
        // Throttle rev rumble crescendo
        navigator.vibrate([20, 20, 30, 25, 45, 30, 70, 35, 90]);
        break;

      case 'success':
        // Celebratory multi-pulse cadence for test drive confirmation
        navigator.vibrate([45, 60, 90, 60, 160]);
        break;

      default:
        navigator.vibrate(15);
    }
  } catch (err) {
    // Graceful fallback for non-supported browsers or security restrictions
  }
};
