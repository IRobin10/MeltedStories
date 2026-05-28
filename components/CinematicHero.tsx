"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function CinematicHero() {
  const [stage, setStage] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Stage 1 -> 2
    const t1 = setTimeout(() => {
      setStage(2);
    }, 3500);

    // Stage 2 -> 3 (Hide "Welcome To")
    const t2 = setTimeout(() => {
      setShowWelcome(false);
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      filter: "blur(8px)",
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 30, rotateX: -90, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 150,
      },
    },
  };

  const renderText = (text: string, prefix: string, addSpace = true) => {
    return text.split(" ").map((word, wIdx, arr) => (
      <span key={`${prefix}-w-${wIdx}`} className={`inline-flex whitespace-nowrap ${(addSpace || wIdx !== arr.length - 1) ? 'mr-[0.25em]' : ''}`}>
        {word.split("").map((char, cIdx) => (
          <motion.span key={`${prefix}-c-${wIdx}-${cIdx}`} variants={letterVariants} className="inline-block">
            {char}
          </motion.span>
        ))}
      </span>
    ));
  };

  // Keep exact font, size, color, style requested by user
  const textClass = "font-pacifico text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#c9a253] drop-shadow-sm pb-2 text-center";

  return (
    <div className="relative w-full h-[60px] flex items-center justify-center [perspective:1000px]">
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div
            key="stage1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute inset-0 flex items-center justify-center z-20 ${textClass}`}
          >
            {renderText("Where Every Melt Has a Story", "stage1", false)}
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="stage2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`absolute inset-0 flex items-center justify-center z-20 ${textClass}`}
          >
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  key="welcome"
                  exit={{ width: 0, opacity: 0, filter: "blur(12px)" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex shrink-0 overflow-hidden whitespace-nowrap items-center py-10 -my-10"
                >
                  <div className="flex pr-[0.25em]">
                    {renderText("Welcome To", "welcome", false)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              layout
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex shrink-0 items-center"
            >
              <motion.div
                animate={!showWelcome ? {
                  textShadow: [
                    "0px 2px 4px rgba(0,0,0,0.1)",
                    "0px 0px 24px rgba(201,162,83,0.65)",
                    "0px 2px 4px rgba(0,0,0,0.1)"
                  ]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex"
              >
                {renderText("Melted Stories", "melted", false)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
