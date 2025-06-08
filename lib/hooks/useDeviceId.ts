import { useEffect, useState } from "react";

export function useDeviceId(): string | undefined {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

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
