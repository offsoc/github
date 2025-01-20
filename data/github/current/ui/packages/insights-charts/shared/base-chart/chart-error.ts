class ChartError extends Error {
  userErrorMessage?: string
  constructor(message: string, userErrorMessage?: string) {
    super(message)
    this.userErrorMessage = userErrorMessage
  }
}

export {ChartError}
