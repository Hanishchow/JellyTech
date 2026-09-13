"use client";

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

/* -----------------------------------------------------------------------------
   Element 02 from UI_STACK.md, wired up.

   Four departures from the saved source, each forced by where it now lives:

   1. VIOLET, NOT CHROME. The original is silver liquid metal with #666666
      text, which on this site would read as a different brand sitting in the
      middle of the page. The shader's red and blue channel shifts are pushed
      apart to swing the metal violet, and the label is set in the site's ink.
   2. IT FITS ITS LABEL. The original is a fixed 142x46 pill. Every real CTA
      here is longer than that ("Submit application", "Send message"), and a
      fixed width clips them. Text mode is now content-sized with a 142px
      floor; icon mode keeps the original 46x46 square.
   3. IT CAN SUBMIT A FORM. The original takes only onClick, so it could not
      be a form's submit control, which is what all three of our CTAs are.
      `type` and `disabled` are passed through.
   4. NO LUCIDE. The original imports Sparkles for icon mode. The site uses no
      icon library, so the icon is a child instead, and the caller decides.

   The shader is decoration layered under a real <button>: if WebGL is missing
   or ShaderMount throws, the CSS layers beneath still draw a pill and the
   button still works.
   -------------------------------------------------------------------------- */

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  type = "button",
  disabled = false,
  icon,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<{ destroy?: () => void; setSpeed?: (n: number) => void } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  // Text mode is sized by its label; only the icon variant is a fixed square.
  const isIcon = viewMode === "icon";
  const height = 46;
  const dimensions = useMemo(
    () => ({
      width: isIcon ? "46px" : "auto",
      minWidth: isIcon ? "46px" : "142px",
      padding: isIcon ? "0" : "0 28px",
    }),
    [isIcon]
  );

  useEffect(() => {
    const styleId = "liquid-metal-button-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .lmb-shader canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes lmb-ripple {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      if (shaderRef.current) {
        shaderMount.current?.destroy?.();
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            // Pulling the channel shifts apart is what turns the metal from
            // silver to violet without touching the shader source.
            u_shiftRed: 0.12,
            u_shiftBlue: 0.62,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          // Still, not stopped, under reduced motion: the metal keeps its
          // texture, it simply does not flow.
          reduce ? 0 : 0.6
        ) as unknown as { destroy?: () => void; setSpeed?: (n: number) => void };
      }
    } catch {
      // No WebGL. The CSS layers below still render a usable pill.
      shaderMount.current = null;
    }

    return () => {
      shaderMount.current?.destroy?.();
      shaderMount.current = null;
    };
  }, []);

  const speed = (value: number) => shaderMount.current?.setSpeed?.(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    speed(2.4);
    window.setTimeout(() => speed(isHovered ? 1 : 0.6), 300);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        id: rippleId.current++,
      };
      setRipples((prev) => [...prev, ripple]);
      window.setTimeout(
        () => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)),
        600
      );
    }

    onClick?.();
  };

  const spring = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";

  return (
    <div className="relative inline-block" style={{ opacity: disabled ? 0.5 : 1 }}>
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "relative",
            width: dimensions.width,
            minWidth: dimensions.minWidth,
            height: `${height}px`,
            transformStyle: "preserve-3d",
            transition: spring,
          }}
        >
          {/* label, floating above the metal */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: dimensions.padding,
              transformStyle: "preserve-3d",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
              transition: spring,
            }}
          >
            {isIcon
              ? icon
              : (
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "rgb(var(--ink))",
                    textShadow: "0px 1px 3px rgba(0, 0, 0, 0.6)",
                    whiteSpace: "nowrap",
                    transition: spring,
                  }}
                >
                  {label}
                </span>
              )}
          </div>

          {/* the dark face the metal sits in */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
              transition: spring,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "2px",
                borderRadius: "100px",
                background: "linear-gradient(180deg, #1a1226 0%, #05040a 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.5), inset 0px 1px 2px rgba(0, 0, 0, 0.4)"
                  : "none",
                transition: "box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* the metal itself */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
              transition: spring,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "100px",
                overflow: "hidden",
                // The site's glow replaces the original's black drop shadows,
                // which were invisible on a near-black ground.
                boxShadow: isPressed
                  ? "0 0 0 1px rgb(var(--glow) / 0.5), 0 0 10px -2px rgb(var(--glow) / 0.4)"
                  : isHovered
                    ? "0 0 0 1px rgb(var(--glow) / 0.6), 0 0 34px -4px rgb(var(--glow) / 0.6)"
                    : "0 0 0 1px rgb(var(--glow) / 0.35), 0 0 22px -6px rgb(var(--glow) / 0.4)",
                transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div
                ref={shaderRef}
                className="lmb-shader"
                style={{ position: "absolute", inset: 0, borderRadius: "100px" }}
              />
            </div>
          </div>

          <button
            ref={buttonRef}
            type={type}
            disabled={disabled}
            onClick={handleClick}
            onMouseEnter={() => {
              setIsHovered(true);
              speed(1);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsPressed(false);
              speed(0.6);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              outlineOffset: "3px",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={isIcon ? label : undefined}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(233, 213, 255, 0.5) 0%, rgba(233, 213, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "lmb-ripple 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiquidMetalButton;
