export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface Credential {
  id: string;
  service: string;
  username: string;
  password: string;
}

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose?: () => void;
  duration?: number; // ms
}
