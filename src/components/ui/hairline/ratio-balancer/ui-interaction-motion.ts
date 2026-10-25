// Hairline UI · ratio-balancer · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

"use client";

import * as React from "react";

export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_SETTLE = "cubic-bezier(0.22, 1.18, 0.36, 1)";
/** Thrown things (indicators, thumbs): a slight overshoot on transform only. */
export const EASE_THROW = "cubic-bezier(0.34, 1.36, 0.64, 1)";
/**
 * The press every button primitive shares: a 3% give that eases in and settles back.
 * Tailwind v4's scale-* writes the `scale` property, so `scale` has to be in the list
 * or the press snaps.
 */
export const INTERACTION_PRESS =
  "transition-[background-color,color,box-shadow,opacity,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
export const INTERACTION_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
export const useInteractionReducedMotion = () =>
  React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );

export function useInteractionActivity<T extends Element>() {
  const ref = React.useRef<T>(null);
  const [visible, setVisible] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(el);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return { ref, active: visible && !hidden };
}

export function interactionIcon(
  on: boolean,
  reduced: boolean,
): React.CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "none" : "scale(0.6)",
    filter: on ? "blur(0px)" : "blur(3px)",
    transition: reduced
      ? "none"
      : `opacity 220ms ${EASE_OUT}, transform 380ms ${EASE_OUT}, filter 220ms ${EASE_OUT}`,
  };
}

/** Sample recent movement rather than averaging a long drag and losing its release velocity. */
export type PointerSample = { x: number; time: number };
export function samplePointer(
  samples: PointerSample[],
  x: number,
  time: number,
) {
  samples.push({ x, time });
  while (samples.length > 2 && time - samples[0].time > 100) samples.shift();
}
export function releaseVelocity(samples: PointerSample[], now: number) {
  if (samples.length < 2 || now - samples[samples.length - 1].time > 100)
    return 0;
  const first = samples[0],
    last = samples[samples.length - 1];
  return (last.x - first.x) / Math.max(1, last.time - first.time);
}

/** Smooth Apple/rational rubber-band curve: continuous exponential-like resistance without linear kinks. */
export function rubberBand(
  overshoot: number,
  dimension = 320,
  constant = 0.55,
): number {
  const d = dimension || 320;
  const abs = Math.abs(overshoot);
  return Math.sign(overshoot) * (1 - 1 / ((abs * constant) / d + 1)) * d;
}

/** Projects resting travel from release velocity (velocity in px/ms; time in seconds). */
export function projectInertia(
  distance: number,
  velocity: number,
  time = 0.12,
): number {
  return distance + velocity * 1000 * time;
}

/** Smooths incoming release velocity toward a boundary so springs don't slam or clip into walls. */
export function softenVelocity(
  velocity: number,
  distanceToTarget: number,
  factor = 10,
): number {
  const maxAllowed = Math.abs(distanceToTarget) * factor;
  return Math.sign(velocity) * Math.min(Math.abs(velocity), maxAllowed);
}

/** A damped spring sampled by WAAPI: tuned for organic lightness with a hint of life (3% breath). */
export function springFrames(
  from: number,
  to: number,
  velocity = 0,
  duration = 480,
  config: { omega?: number; damping?: number; steps?: number } = {},
) {
  const { omega = 16, damping = 0.74, steps = 36 } = config;
  const damped = omega * Math.sqrt(Math.max(0.001, 1 - damping * damping));
  const displacement = from - to;
  const coefficient =
    (velocity * 1000 + damping * omega * displacement) / damped;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * (duration / 1000);
    const value =
      to +
      Math.exp(-damping * omega * t) *
        (displacement * Math.cos(damped * t) +
          coefficient * Math.sin(damped * t));
    return { value: i === steps ? to : value, offset: i / steps };
  });
}
