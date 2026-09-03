"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import classNames from "classnames";
import BoxIcon from "../box_icon";

interface TrailStep {
  path: string;
  name: string;
}

const TRAIL_KEY = "problem_set_trail";

export function SourceSetButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [previousStep, setPreviousStep] = useState<TrailStep | null>(null);

  useEffect(() => {
    const rawTrail = sessionStorage.getItem(TRAIL_KEY);
    if (!rawTrail) return;

    try {
      const trail: TrailStep[] = JSON.parse(rawTrail);

      // If we are currently at the top level of the trail, don't show the back button
      if (trail.length > 0) {
        setPreviousStep(trail[trail.length - 1]);
      } else {
        setPreviousStep(null);
      }
    } catch {
      setPreviousStep(null);
    }
  }, [pathname]);

  if (!previousStep) {
    return null;
  }

  const handleBack = () => {
    const rawTrail = sessionStorage.getItem(TRAIL_KEY);
    if (!rawTrail) return;

    try {
      const trail: TrailStep[] = JSON.parse(rawTrail);

      // Pop the target location off the stack
      const targetStep = trail.pop();

      // Save the trimmed trail back to storage
      sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail));

      if (targetStep) {
        router.push(targetStep.path);
      }
    } catch {
      router.push("/problem-sets");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-1 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
    >
      <BoxIcon
        name="bx-chevron-left"
        className={classNames("bx text-gray-300 hover:text-gray-500", "bx-sm")}
      />
      Back to {previousStep.name || "Problem Sets"}
    </button>
  );
}
