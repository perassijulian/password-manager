"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";

export function usePasswordStrength(minScore = 3) {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkStrength = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = zxcvbn(e.target.value);
    setScore(result.score); // score: 0 to 4
    setFeedback(
      result.feedback.warning || result.feedback.suggestions.join(" ")
    );
  };

  const isStrongEnough = score >= minScore;

  return { score, feedback, checkStrength, isStrongEnough };
}
