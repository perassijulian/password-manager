import { useEffect, useState } from "react";

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let stored = localStorage.getItem("deviceId");

    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem("deviceId", stored);
    }

    setDeviceId(stored);
  }, []);

  return deviceId;
}
