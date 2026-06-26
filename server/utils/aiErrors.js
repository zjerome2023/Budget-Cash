export class AiConfigError extends Error {
  constructor(message = 'AI features are not configured on this server') {
    super(message);
    this.name = 'AiConfigError';
    this.statusCode = 503;
  }
}

export class AiServiceError extends Error {
  constructor(message = 'AI service temporarily unavailable') {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = 502;
  }
}

export class AiRateLimitError extends Error {
  constructor(message = 'AI provider rate limit exceeded. Try again later.') {
    super(message);
    this.name = 'AiRateLimitError';
    this.statusCode = 429;
  }
}
