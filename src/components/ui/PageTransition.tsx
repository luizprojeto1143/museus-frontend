import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageVariants, durations } from "../../lib/motion";

interface PageTransitionProps {
  children: React.ReactNode;
  /** Disable animation (e.g. on initial load) */
  disabled?: boolean;
}

/**
 * PageTransition — Wraps route content with smooth page transitions.
 *
 * Uses AnimatePresence with location-based keys
 * to animate between route changes.
 *
 * @example
 * // In App.tsx:
 * <PageTransition>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </PageTransition>
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  disabled = false,
}) => {
  const location = useLocation();

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ duration: durations.pageTransition }}
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

PageTransition.displayName = "PageTransition";
