import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Parallax offset in px (0 = no parallax) */
  parallax?: number;
  /** Scale start value */
  scaleFrom?: number;
}

const ScrollReveal = ({
  children,
  className = "",
  parallax = 0,
  scaleFrom = 1,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [scaleFrom, 1, 1, scaleFrom]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div ref={ref} style={{ y, scale, opacity }} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
