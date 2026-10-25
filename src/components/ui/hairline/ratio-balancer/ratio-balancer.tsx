// Hairline UI · ratio-balancer · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

"use client";

/* ─────────────────────────────────────────────────────────
 * RATIO BALANCER: constrained multi-segment resource allocator
 *
 *   track      a single 1px hairline bar dividing 100% across
 *              segments; each segment expands or shrinks with
 *              flex-grow
 *   dividers   tactile hairline divider grips; delta-based drag
 *              ensures 1:1 finger tracking with zero initial
 *              jump on mobile and desktop
 *   numbers    percentage readouts roll in place via NumberRoll
 *              upon release; DOM text updates immediately while
 *              dragging
 *   touch      expanded 36px touch targets allow effortless finger
 *              dragging on phones
 *
 * Dividers are accessible separators with ArrowLeft/Right keys.
 * ───────────────────────────────────────────────────────── */

import * as React from "react";
import { NumberRoll } from "./number-roll";
import {
  INTERACTION_FOCUS,
  useInteractionReducedMotion,
} from "./ui-interaction-motion";
import {
  normalizeRatios,
  type RatioSegment,
  useRatioBalancer,
} from "./use-ratio-balancer";

export type { RatioSegment };

export interface RatioBalancerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  label?: string;
  segments?: RatioSegment[];
  defaultSegments?: RatioSegment[];
  minRatio?: number;
  disabled?: boolean;
  showLegend?: boolean;
  onValueChange?: (ratios: number[]) => void;
  onValueCommit?: (ratios: number[]) => void;
}

const DEFAULT_SEGMENTS: RatioSegment[] = [
  { id: "inference", label: "Inference", ratio: 50 },
  { id: "training", label: "Training", ratio: 30 },
  { id: "cache", label: "Cache & KV", ratio: 20 },
];

const COLORS = [
  "bg-primary/10 text-primary border-primary/25",
  "bg-foreground/5 text-foreground border-foreground/15",
  "bg-muted text-muted-foreground border-border",
  "bg-accent text-accent-foreground border-border",
  "bg-primary/5 text-foreground border-primary/20",
];

export function RatioBalancer({
  label,
  segments: controlledSegments,
  defaultSegments = DEFAULT_SEGMENTS,
  minRatio = 5,
  disabled = false,
  showLegend = true,
  onValueChange,
  onValueCommit,
  className = "",
  ...props
}: RatioBalancerProps) {
  const reduced = useInteractionReducedMotion();
  const [internalSegments, setInternalSegments] =
    React.useState<RatioSegment[]>(defaultSegments);
  const segments = controlledSegments ?? internalSegments;

  const currentRatios = React.useMemo(
    () => normalizeRatios(segments.map((s) => s.ratio)),
    [segments],
  );

  const handleChange = React.useCallback(
    (nextRatios: number[]) => {
      onValueChange?.(nextRatios);
    },
    [onValueChange],
  );

  const handleCommit = React.useCallback(
    (nextRatios: number[]) => {
      if (!controlledSegments) {
        setInternalSegments((prev) =>
          prev.map((seg, i) => ({
            ...seg,
            ratio: nextRatios[i] ?? seg.ratio,
          })),
        );
      }
      onValueCommit?.(nextRatios);
    },
    [controlledSegments, onValueCommit],
  );

  const balancer = useRatioBalancer({
    segments,
    minRatio,
    disabled,
    reduced,
    onChange: handleChange,
    onCommit: handleCommit,
  });

  return (
    <div
      {...props}
      role="region"
      aria-label={label ?? "Podział udziałów"}
      className={`relative flex w-full max-w-xl select-none flex-col text-foreground ${className}`}
    >
      {/* Label and Total */}
      {label && (
        <div className="mb-3 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
          <span>{label}</span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/80">
            SUMA 100%
          </span>
        </div>
      )}

      {/* Main Bar Track (Hairline borders only, zero heavy shadows) */}
      <div
        ref={(el) => balancer.attachTrack(el)}
        className="relative flex h-14 w-full overflow-hidden rounded-[14px] border border-border bg-muted p-1"
      >
        {segments.map((seg, i) => {
          const colorClass = COLORS[i % COLORS.length];
          const isLast = i === segments.length - 1;
          const ratio = currentRatios[i] ?? seg.ratio;

          return (
            <React.Fragment key={seg.id}>
              {/* Segment Cell */}
              <div
                ref={(el) => balancer.attachSegment(i, el)}
                className={`relative flex min-w-[42px] flex-col justify-between overflow-hidden rounded-[10px] border px-2.5 py-1.5 transition-[flex-grow] will-change-[flex-grow] ${colorClass}`}
                style={{ flexGrow: ratio }}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[11px] font-medium tracking-tight">
                    {seg.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span
                    ref={(el) => balancer.attachReadout(i, el)}
                    style={{
                      display:
                        balancer.activeDivider !== null ? "inline" : "none",
                    }}
                    className="font-mono text-[13px] font-medium tabular-nums"
                  >
                    {Math.round(ratio)}%
                  </span>
                  <span
                    style={{
                      display:
                        balancer.activeDivider !== null ? "none" : "inline",
                    }}
                    className="font-mono text-[13px] font-medium tabular-nums"
                  >
                    <NumberRoll
                      value={Math.round(ratio)}
                      suffix="%"
                      duration={380}
                    />
                  </span>
                </div>
              </div>

              {/* Divider Grip (Expanded 36px touch hit area for mobile fingers) */}
              {!isLast && (
                <div className="relative z-10 flex w-3 shrink-0 items-center justify-center">
                  <button
                    ref={(el) => balancer.attachDivider(i, el)}
                    {...balancer.getDividerProps(i)}
                    type="button"
                    role="separator"
                    disabled={disabled}
                    aria-orientation="vertical"
                    aria-label={`Zmień podział między ${seg.label} a ${segments[i + 1]?.label}`}
                    style={{ touchAction: "none" }}
                    className={`group relative -inset-y-1 flex h-full w-3 cursor-ew-resize items-center justify-center touch-none select-none rounded before:absolute before:-inset-x-3.5 before:inset-y-0 before:content-[''] disabled:cursor-default disabled:opacity-40 ${INTERACTION_FOCUS}`}
                  >
                    <span className="h-6 w-0.5 rounded-full bg-border transition-colors group-hover:bg-primary group-focus-visible:bg-primary" />
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showLegend ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Przeciągnij linie, aby zmienić udziały.</span>
          </span>
          <div className="flex items-center gap-3">
            {segments.map((seg) => (
              <span
                key={seg.id}
                className="flex items-center gap-1 font-mono text-[10px] tabular-nums"
              >
                <span>{seg.label}:</span>
                <span className="font-semibold text-foreground">
                  {Math.round(
                    currentRatios[segments.indexOf(seg)] ?? seg.ratio,
                  )}
                  %
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
