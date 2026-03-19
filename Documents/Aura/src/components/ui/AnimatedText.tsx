"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  variant?: "words" | "chars" | "fade-up" | "blur";
  className?: string;
  once?: boolean;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const blurVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedText({
  text,
  variant = "words",
  className,
  once = true,
  delay = 0,
  stagger = 0.05,
  as: Tag = "div",
}: AnimatedTextProps) {
  if (variant === "fade-up") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        variants={fadeUpVariants}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
      >
        {text}
      </motion.div>
    );
  }

  if (variant === "blur") {
    const words = text.split(" ");
    return (
      <Tag className={className}>
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once }}
          transition={{ staggerChildren: stagger, delayChildren: delay }}
          className="inline"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={blurVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      </Tag>
    );
  }

  if (variant === "words") {
    const words = text.split(" ");
    return (
      <Tag className={className}>
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once }}
          transition={{ staggerChildren: stagger, delayChildren: delay }}
          className="inline"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      </Tag>
    );
  }

  // chars
  const chars = text.split("");
  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
        className="inline"
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            variants={charVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-block"
            style={{ whiteSpace: char === " " ? "pre" : undefined }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

export default AnimatedText;
