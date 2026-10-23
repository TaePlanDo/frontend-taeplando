// Hairline UI · ratio-balancer · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

"use client";

import * as React from "react";
import { EASE_OUT } from "./ui-interaction-motion";

export interface RatioSegment {
  id: string;
  label: string;
  ratio: number;
  color?: string;
}

type Options = {
  segments: RatioSegment[];
  minRatio?: number;
  disabled: boolean;
  reduced: boolean;
  onChange?: (ratios: number[]) => void;
  onCommit?: (ratios: number[]) => void;
};

/** Normalizes ratios to sum cleanly to 100. */
export function normalizeRatios(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    const even = 100 / values.length;
    return values.map(() => Math.round(even));
  }
  let acc = 0;
  const result = values.map((v, i) => {
    if (i === values.length - 1) return Math.max(0, 100 - acc);
    const rounded = Math.round((v / sum) * 100);
    acc += rounded;
    return rounded;
  });
  return result;
}

export function useRatioBalancer(options: Options) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const readoutRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const dividerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const [activeDivider, setActiveDivider] = React.useState<number | null>(null);

  const gesture = React.useRef<{
    id: number;
    dividerIndex: number;
    startX: number;
    startRatios: number[];
    startRatioLeft: number;
    startRatioRight: number;
    currentRatios: number[];
    trackWidth: number;
  } | null>(null);

  const paint = React.useCallback((ratios: number[], animate: boolean) => {
    const o = optionsRef.current;
    ratios.forEach((ratio, i) => {
      const seg = segmentRefs.current[i];
      if (seg) {
        seg.style.transition =
          animate && !o.reduced ? `flex-grow 360ms ${EASE_OUT}` : "none";
        seg.style.flexGrow = String(ratio);
      }
      const readout = readoutRefs.current[i];
      if (readout) {
        readout.textContent = `${Math.round(ratio)}%`;
      }
    });

    // Update divider aria attributes
    let accumulated = 0;
    ratios.slice(0, -1).forEach((ratio, i) => {
      accumulated += ratio;
      const div = dividerRefs.current[i];
      if (div) {
        div.setAttribute("aria-valuenow", String(Math.round(accumulated)));
      }
    });
  }, []);

  const commit = React.useCallback(
    (next: number[], animate = true) => {
      const clean = normalizeRatios(next);
      paint(clean, animate);
      optionsRef.current.onChange?.(clean);
      optionsRef.current.onCommit?.(clean);
    },
    [paint],
  );

  const finish = React.useCallback(
    (cancelled: boolean) => {
      const g = gesture.current;
      if (!g) return;
      gesture.current = null;
      setActiveDivider(null);

      if (cancelled) {
        paint(g.startRatios, true);
        optionsRef.current.onChange?.(g.startRatios);
      } else {
        commit(g.currentRatios, false);
      }
    },
    [commit, paint],
  );

  React.useLayoutEffect(() => {
    if (!gesture.current) {
      const currentRatios = options.segments.map((s) => s.ratio);
      paint(currentRatios, true);
    }
  }, [options.segments, options.reduced, paint]);

  React.useEffect(() => {
    const interrupted = () => finish(true);
    const hidden = () => {
      if (document.hidden) interrupted();
    };
    window.addEventListener("blur", interrupted);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", interrupted);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [finish]);

  const startDrag = React.useCallback(
    (dividerIndex: number, event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || !event.isPrimary || optionsRef.current.disabled)
        return;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus({ preventScroll: true });

      const currentRatios = optionsRef.current.segments.map((s) => s.ratio);

      gesture.current = {
        id: event.pointerId,
        dividerIndex,
        startX: event.clientX,
        startRatios: [...currentRatios],
        startRatioLeft: currentRatios[dividerIndex] ?? 50,
        startRatioRight: currentRatios[dividerIndex + 1] ?? 50,
        currentRatios: [...currentRatios],
        trackWidth: Math.max(1, rect.width),
      };

      setActiveDivider(dividerIndex);
      paint(currentRatios, false);
    },
    [paint],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const g = gesture.current;
      const o = optionsRef.current;
      if (!g || g.id !== event.pointerId) return;

      const idx = g.dividerIndex;
      const minRatio = o.minRatio ?? 5;

      // Delta-based calculation guarantees zero initial jump and 1:1 physical tracking
      const deltaX = event.clientX - g.startX;
      const deltaPercent = (deltaX / g.trackWidth) * 100;
      const pairTotal = g.startRatioLeft + g.startRatioRight;

      let newLeft = Math.round(g.startRatioLeft + deltaPercent);
      newLeft = Math.max(minRatio, Math.min(pairTotal - minRatio, newLeft));
      const newRight = pairTotal - newLeft;

      const next = [...g.currentRatios];
      next[idx] = newLeft;
      next[idx + 1] = newRight;

      if (
        next[idx] === g.currentRatios[idx] &&
        next[idx + 1] === g.currentRatios[idx + 1]
      )
        return;

      g.currentRatios = next;
      paint(next, false);
      o.onChange?.(next);
    },
    [paint],
  );

  const makeKeyHandler = React.useCallback(
    (dividerIndex: number) =>
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          finish(true);
          return;
        }

        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();

        const o = optionsRef.current;
        const delta =
          (event.shiftKey ? 5 : 1) * (event.key === "ArrowRight" ? 1 : -1);
        const minRatio = o.minRatio ?? 5;
        const segs = o.segments;

        const ratios = segs.map((s) => s.ratio);
        const combined = ratios[dividerIndex] + ratios[dividerIndex + 1];

        let newLeft = ratios[dividerIndex] + delta;
        newLeft = Math.max(minRatio, Math.min(combined - minRatio, newLeft));

        const next = [...ratios];
        next[dividerIndex] = newLeft;
        next[dividerIndex + 1] = combined - newLeft;

        commit(next);
      },
    [commit, finish],
  );

  const attachTrack = React.useCallback((el: HTMLDivElement | null) => {
    trackRef.current = el;
  }, []);
  const attachSegment = React.useCallback(
    (i: number, el: HTMLDivElement | null) => {
      segmentRefs.current[i] = el;
    },
    [],
  );
  const attachReadout = React.useCallback(
    (i: number, el: HTMLSpanElement | null) => {
      readoutRefs.current[i] = el;
    },
    [],
  );
  const attachDivider = React.useCallback(
    (i: number, el: HTMLButtonElement | null) => {
      dividerRefs.current[i] = el;
    },
    [],
  );

  const getDividerProps = React.useCallback(
    (idx: number) => ({
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) =>
        startDrag(idx, e),
      onPointerMove,
      onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.pointerId === gesture.current?.id) finish(false);
      },
      onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.pointerId === gesture.current?.id) finish(true);
      },
      onLostPointerCapture: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.pointerId === gesture.current?.id) finish(true);
      },
      onBlur: () => finish(true),
      onKeyDown: makeKeyHandler(idx),
    }),
    [startDrag, onPointerMove, finish, makeKeyHandler],
  );

  return {
    attachTrack,
    attachSegment,
    attachReadout,
    attachDivider,
    activeDivider,
    commit,
    getDividerProps,
  };
}
