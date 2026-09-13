"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

const CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 26,
}

interface MorphingPageDotsProps {
  count: number
  activeIndex: number
  onDotClick?: (index: number) => void
  className?: string
  dotClassName?: string
  activeClassName?: string
}

function MorphingPageDots({
  count,
  activeIndex,
  onDotClick,
  className,
  dotClassName,
  activeClassName,
}: MorphingPageDotsProps) {
  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="show"
      className={cn("flex items-center gap-2", className)}
      role="tablist"
      aria-label="Page indicator"
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Page ${index + 1}`}
            onClick={() => onDotClick?.(index)}
            className="group flex h-8 min-w-8 items-center justify-center p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative flex h-2 items-center">
              {isActive && (
                <motion.span
                  layoutId="morphing-page-dot-active"
                  transition={SPRING}
                  className={cn(
                    "absolute inset-0 rounded-full bg-primary",
                    activeClassName
                  )}
                />
              )}
              <motion.span
                layout
                transition={SPRING}
                className={cn(
                  "relative h-2 rounded-full transition-colors",
                  isActive ? "w-8" : "w-2",
                  isActive
                    ? "bg-primary"
                    : "bg-foreground/20 group-hover:bg-foreground/40",
                  dotClassName
                )}
              />
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}

export { MorphingPageDots }