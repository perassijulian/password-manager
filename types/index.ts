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
