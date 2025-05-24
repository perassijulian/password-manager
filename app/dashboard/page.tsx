import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function Dashboard() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      const decoded = jwt.decode(token) as any;
      setUserId(decoded.userId);
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, User: {userId}</h1>
    </div>
  );
}
