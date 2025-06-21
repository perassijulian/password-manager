"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";

export function usePasswordStrength(minScore = 3) {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkStrength = (password: string) => {
    const result = zxcvbn(password);
    setScore(result.score); // score: 0 to 4

    const newErrors: string[] = [];

    if (password.length < 10) newErrors.push("At least 10 characters");
    if (!/[A-Z]/.test(password))
      newErrors.push("At least one uppercase letter");
    if (!/[a-z]/.test(password))
      newErrors.push("At least one lowercase letter");
    if (!/[0-9]/.test(password)) newErrors.push("At least one number");
    if (!/[^a-zA-Z0-9]/.test(password))
      newErrors.push("At least one special character");

    const zxcvbnFeedback = [
      result.feedback.warning,
      ...result.feedback.suggestions,
    ].filter(Boolean);

    setFeedback([...zxcvbnFeedback, ...newErrors].join(". "));
  };

  const isStrongEnough = score >= minScore;

  return { score, feedback, checkStrength, isStrongEnough };
}
