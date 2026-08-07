import { useEffect } from 'react';
import Lenis from 'lenis';

const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
};

export default useLenis;
