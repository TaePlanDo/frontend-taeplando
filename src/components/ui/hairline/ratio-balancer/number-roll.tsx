// Hairline UI · number-roll · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * NUMBER ROLL: numbers that change like an odometer
 *
 *   rolling   each digit is a column that rolls to its new
 *             value, in the direction the number moved: going
 *             up, a 9 rolls on to 0 instead of spinning back
 *   places    new places slide open from nothing; lost ones
 *             fold away
 *   format    anything Intl.NumberFormat does: currency,
 *             percent, compact ("1.2K"), decimals
 *
 * The real number is always there as text for screen readers
 * and copy and paste; the columns are only what you see.
 * ───────────────────────────────────────────────────────── */

export interface NumberRollProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  value: number;
  /** Intl.NumberFormat options, e.g. { style: "currency", currency: "USD" }. */
  format?: Intl.NumberFormatOptions;
  /** Format in this locale everywhere. Without it, a server render and hydration use en-US and the visitor's locale takes over after mount. */
  locales?: string | string[];
  prefix?: string;
  suffix?: string;
  /** Start from this value and roll to `value` once mounted, e.g. 0 for stats. */
  from?: number;
  /** Roll duration in ms. */
  duration?: number;
  /** Always roll this way, e.g. "down" for a countdown's seconds, which wrap from 00 to 59. Defaults to the way the number moved. */
  direction?: "up" | "down";
}

type Column = { key: string; char: string; digit: number | null };

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const SETS = 5; // the strip repeats 0–9 five times so a roll never runs out of digits
const MIDDLE = 20;
/** The strip as one text node, a digit a line: fifty lines, but one element to lay out instead of fifty. */
const STRIP = Array.from({ length: SETS * 10 }, (_, i) => i % 10).join("\n");

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

// Without `locales`, the server and the visitor's browser can format the same number differently ("$29" in Node,
// "US$29" in an en-GB browser) and hydration would fail. So the server render and the hydrating render share one
// fixed locale, and the visitor's own takes over straight after; a client-only mount uses the visitor's from the start.
const HYDRATION_LOCALE = "en-US";
const subscribeNothing = () => () => {};
const useHydrated = () =>
  React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

/** Digits are keyed by their place counted from the right, so the units column stays the units column. */
function columns(text: string): Column[] {
  const chars = [...text];
  const seen = new Map<string, number>();
  let place = 0;
  const out: Column[] = [];
  for (let i = chars.length - 1; i >= 0; i--) {
    const char = chars[i];
    if (/\d/.test(char))
      out.push({ key: `d${place++}`, char, digit: Number(char) });
    else {
      // Symbols are keyed by how many of the same symbol sit to their right, so a comma that shifts is the same comma.
      const n = seen.get(char) ?? 0;
      seen.set(char, n + 1);
      out.push({ key: `s${char}${n}`, char, digit: null });
    }
  }
  return out.reverse();
}

// Memoised: a parent that re-renders with the same number doesn't rebuild the strips.
const Digit = React.memo(function Digit({
  digit,
  trend,
  duration,
  reduced,
  rollIn,
}: {
  digit: number;
  trend: number;
  duration: number;
  reduced: boolean;
  rollIn: boolean;
}) {
  // Where the strip starts: a digit that arrives after the first paint rolls in from 0. The strip's position from then on
  // lives in a ref and goes straight to the element, so a roll never re-renders and React never undoes the rebase below.
  const [start] = React.useState(() => MIDDLE + (rollIn ? 0 : digit));
  const posRef = React.useRef(start);
  const stripRef = React.useRef<HTMLSpanElement>(null);

  const place = React.useCallback(
    (pos: number, animate: boolean) => {
      const strip = stripRef.current;
      if (!strip) return;
      strip.style.transition = animate
        ? `transform ${duration}ms ${EASE}`
        : "none";
      strip.style.transform = `translateY(${(-pos * 100) / (SETS * 10)}%)`;
    },
    [duration],
  );

  React.useLayoutEffect(() => {
    const current = posRef.current;
    const showing = ((current % 10) + 10) % 10;
    if (showing === digit) return;
    if (reduced) {
      posRef.current = MIDDLE + digit;
      place(posRef.current, false);
      return;
    }
    const up = trend > 0 || (trend === 0 && digit > showing);
    let target = up
      ? current + ((digit - showing + 10) % 10)
      : current - ((showing - digit + 10) % 10);
    // Values arriving faster than a roll (a progress percent) never let it re-centre, so before it runs off the strip,
    // jump the strip back by whole sets mid-roll (it looks identical) and roll on from there.
    if (target < 10 || target > SETS * 10 - 11) {
      const shift = Math.round((target - MIDDLE) / 10) * 10;
      const strip = stripRef.current;
      if (strip?.offsetHeight) {
        let visual = current;
        try {
          visual =
            -new DOMMatrixReadOnly(getComputedStyle(strip).transform).m42 /
            (strip.offsetHeight / (SETS * 10));
        } catch {
          // Invalid or "none" transform — keep current visual position.
        }
        strip.style.transition = "none";
        strip.style.transform = `translateY(${(-(visual - shift) * 100) / (SETS * 10)}%)`;
        void strip.offsetHeight;
      }
      target -= shift;
    }
    posRef.current = target;
    place(target, true);
  }, [digit, trend, reduced, place]);

  // After a roll, quietly re-centre on the middle set so the next roll always has room.
  const settle = () => {
    posRef.current = MIDDLE + (((posRef.current % 10) + 10) % 10);
    place(posRef.current, false);
  };

  return (
    <span className="relative inline-block [clip-path:inset(0)]">
      <span className="invisible">{digit}</span>
      <span
        ref={stripRef}
        aria-hidden="true"
        onTransitionEnd={settle}
        className="absolute inset-x-0 top-0 block whitespace-pre text-center"
        style={{ transform: `translateY(${(-start * 100) / (SETS * 10)}%)` }}
      >
        {STRIP}
      </span>
    </span>
  );
});

/** A place that appeared after the first paint slides open; places that were there from the start just sit. */
function Place({
  enter,
  children,
}: {
  enter: boolean;
  children: React.ReactNode;
}) {
  const [entering] = React.useState(enter);
  return (
    <span
      className={`inline-block ${entering ? "[clip-path:inset(0)] animate-[ui-col-in_500ms_cubic-bezier(0.16,1,0.3,1)_both]" : ""}`}
    >
      {children}
    </span>
  );
}

const NOTHING_NEW: ReadonlySet<string> = new Set();

export function NumberRoll({
  value,
  format,
  locales,
  prefix = "",
  suffix = "",
  from,
  duration = 900,
  direction,
  className = "",
  ...props
}: NumberRollProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState(from ?? value);

  // Roll from `from` to the real value once on screen (a frame later, so the start is painted).
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const hydrated = useHydrated();
  const locale = locales ?? (hydrated ? undefined : HYDRATION_LOCALE);
  const localeKey = String(locale);
  const formatter = React.useMemo(
    () => new Intl.NumberFormat(locale, format),
    [locale, format],
  );
  const text = `${prefix}${formatter.format(shown)}${suffix}`;
  const cols = React.useMemo(() => columns(text), [text]);

  // What changed since the last number: places that are new (they slide open and roll in from 0), places that are gone
  // (they fold away) and which way it moved. Worked out while rendering, from the last columns kept in state.
  // A change of locale (the visitor's taking over after hydration) isn't a change of number, so it swaps in place.
  const [last, setLast] = React.useState({
    text,
    cols,
    shown,
    localeKey,
    snap: false,
    moved: 0,
    entering: NOTHING_NEW,
    leaving: [] as Column[],
  });
  let view = last;
  if (
    last.text !== text ||
    last.shown !== shown ||
    last.localeKey !== localeKey
  ) {
    const before = new Set(last.cols.map((c) => c.key));
    const after = new Set(cols.map((c) => c.key));
    const snap = last.localeKey !== localeKey && last.shown === shown;
    view = {
      text,
      cols,
      shown,
      localeKey,
      snap,
      moved: Math.sign(shown - last.shown),
      entering: snap
        ? NOTHING_NEW
        : new Set(cols.filter((c) => !before.has(c.key)).map((c) => c.key)),
      leaving:
        reduced || snap ? [] : last.cols.filter((c) => !after.has(c.key)),
    };
    setLast(view);
  }
  const still = reduced || view.snap;
  const trend = direction === "up" ? 1 : direction === "down" ? -1 : view.moved;

  // Lost places are drawn folding away for as long as the fold takes.
  React.useEffect(() => {
    if (!last.leaving.length) return;
    const timer = window.setTimeout(
      () => setLast((l) => ({ ...l, leaving: [] })),
      420,
    );
    return () => window.clearTimeout(timer);
  }, [last.leaving]);

  return (
    <span className={`inline-flex tabular-nums ${className}`} {...props}>
      <span className="sr-only">{`${prefix}${formatter.format(value)}${suffix}`}</span>
      <span
        aria-hidden="true"
        className="inline-flex items-baseline whitespace-pre"
      >
        {view.leaving.map((c) => (
          <span
            key={`out-${c.key}`}
            className="inline-block [clip-path:inset(0)] animate-[ui-col-out_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
          >
            {c.char}
          </span>
        ))}
        {cols.map((c) => {
          const isNew = view.entering.has(c.key);
          return (
            <Place key={c.key} enter={isNew && !still}>
              {c.digit === null ? (
                c.char
              ) : (
                <Digit
                  digit={c.digit}
                  trend={trend}
                  duration={duration}
                  reduced={still}
                  rollIn={isNew}
                />
              )}
            </Place>
          );
        })}
      </span>
    </span>
  );
}
