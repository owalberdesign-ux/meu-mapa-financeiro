"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types/diagnostic";
import { PROFILE_LABEL, PROFILE_TONE } from "@/lib/report-builder";
import { Meter, StatusBadge } from "@/components/ui";

function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return value;
}

export function ScoreCard({
  score,
  profile,
  animate = false,
}: {
  score: number;
  profile: Profile;
  animate?: boolean;
}) {
  const shown = useCountUp(score, animate);
  const tone = PROFILE_TONE[profile];

  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
        Seu score
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <p className="leading-none" aria-label={`${score} de 100`}>
          <span className="text-6xl font-semibold tracking-tighter">{shown}</span>
          <span className="ml-1 text-2xl font-medium text-muted">/ 100</span>
        </p>
        <StatusBadge tone={tone}>{PROFILE_LABEL[profile]}</StatusBadge>
      </div>
      <div className="mt-4">
        <Meter value={shown / 100} tone={tone} label="Score financeiro" />
      </div>
    </div>
  );
}
