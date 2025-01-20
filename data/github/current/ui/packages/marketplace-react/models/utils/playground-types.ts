export class ContentErrorResponseError extends Error {}
export const TokenLimitReachedResponseErrorDescription = 'The conversation token limit has been reached. '
export class TokenLimitReachedResponseError extends Error {
  constructor() {
    super(TokenLimitReachedResponseErrorDescription)
  }
}

export class RetryableError extends Error {
  retryable: boolean
  constructor(message: string) {
    super(message)
    this.retryable = true
  }
}

export class TooManyRequestsError extends RetryableError {}

// Analytics events
export const PlaygroundChatRequestSent = 'github_models.playground.chat_request.sent'
export const PlaygroundChatRateLimited = 'github_models.playground.chat_request.rate_limited'
export const PlaygroundChatRequestStreamingStarted = 'github_models.playground.chat_request.streaming_started'
export const PlaygroundChatRequestStreamingCompleted = 'github_models.playground.chat_request.streaming_completed'
export const GettingStartedButtonClicked = 'github_models.getting_started.clicked'
export const RunCodespaceButtonClicked = 'github_models.run_codespace.clicked'

// Codespaces
export const templateRepositoryNwo = 'github/codespaces-models'
