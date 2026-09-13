"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function JellyHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "/static/js/app.develop.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden",
        "bg-[#0a0a0a]"
      )}
      id="jellyfish-container"
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="fixed inset-0 w-full h-full z-0"
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      <div id="info" className="hidden" aria-hidden="true" />
      <div id="cover-info" className="hidden" aria-hidden="true" />
      <div id="container-controls" className="hidden" aria-hidden="true" />
      <div id="container-stats" className="hidden" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-6 max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white">
            JellyTech
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            The Editorial Wing of Bio Infinity Forum — Where Technology Meets Biology
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <a href="/signup">Join the Movement</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
              <a href="/login">Log In</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="h-8 w-8 text-white/50" />
        </motion.div>
      </div>
    </section>
  );
}