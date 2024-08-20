"use client";

import { useState, useEffect, FC } from "react";
import { useAnimate, stagger, motion } from "framer-motion";
import { cn } from "@/utils";

const staggerMenuItems = stagger(0.1, { startDelay: 0.15 });

interface DropdownProps {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  selected: string;
  className?: string;
}

export const Dropdown: FC<DropdownProps> = ({
  options,
  onSelect,
  selected,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(".arrow", { rotate: isOpen ? 180 : 0 }, { duration: 0.2 });

    animate(
      "ul",
      {
        clipPath: isOpen
          ? "inset(0% 0% 0% 0% round 10px)"
          : "inset(10% 50% 90% 50% round 10px)",
      },
      {
        type: "spring",
        bounce: 0,
        duration: 0.5,
      }
    );

    animate(
      "li",
      isOpen
        ? { opacity: 1, scale: 1, filter: "blur(0px)" }
        : { opacity: 0, scale: 0.3, filter: "blur(20px)" },
      {
        duration: 0.2,
        delay: isOpen ? staggerMenuItems : 0,
      }
    );
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scope.current && !scope.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("menu", className)} ref={scope}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
        <div className="arrow" style={{ transformOrigin: "50% 55%" }}>
          <svg width="15" height="15" viewBox="0 0 20 20">
            <path d="M0 7 L 20 7 L 10 16" />
          </svg>
        </div>
      </motion.button>
      <ul
        style={{
          pointerEvents: isOpen ? "auto" : "none",
          clipPath: "inset(10% 50% 90% 50% round 10px)",
        }}
      >
        {options.map((option) => (
          <motion.li
            key={option.value}
            onClick={() => {
              onSelect(option.value);
              setIsOpen(false);
            }}
            initial={{ position: "relative" }}
            whileHover={{ scale: 1.05 }}
            style={{
              position: "relative",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            {option.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
