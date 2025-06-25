export class RateLimitError extends Error {
  status: number;

  constructor(message: string, status = 429) {
    super(message);
    this.name = "RateLimitError";
    this.status = status;
  }
}
