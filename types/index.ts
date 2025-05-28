export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
