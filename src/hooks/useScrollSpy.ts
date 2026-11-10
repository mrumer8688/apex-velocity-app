import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds: string[], offset: number = 180): string {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;

          // If at the very top of page
          if (scrollY < 100 && sectionIds.length > 0) {
            setActiveSection(sectionIds[0]);
            ticking = false;
            return;
          }

          // If scrolled to the bottom of the page, activate the last section
          if (windowHeight + scrollY >= docHeight - 80 && sectionIds.length > 0) {
            setActiveSection(sectionIds[sectionIds.length - 1]);
            ticking = false;
            return;
          }

          // Check which section is currently active based on viewport position
          let current = sectionIds[0];
          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              // When the top of the section crosses into view (above offset threshold)
              if (rect.top <= offset) {
                current = id;
              }
            }
          }

          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial detection
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}
