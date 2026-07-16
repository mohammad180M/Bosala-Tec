export function detectMobileProfile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}
