"use client";

import { cn } from "@/utils";
import { FC, useEffect, useState } from "react";

interface TimerProps {
  isRunning: boolean;
  reset: boolean;
  className?: string;
}

export const Timer: FC<TimerProps> = ({ isRunning, reset, className }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      setStartTime(Date.now());
      intervalId = setInterval(() => {
        if (startTime !== null) {
          setElapsedTime(Date.now() - startTime);
        }
      }, 100);
    } else if (!isRunning && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  useEffect(() => {
    if (!isRunning && reset) {
      setElapsedTime(0);
    }
  }, [isRunning, reset]);

  return (
    <div className={cn("", className)}>
      Time: {(elapsedTime / 1000).toFixed(2)}s
    </div>
  );
};
