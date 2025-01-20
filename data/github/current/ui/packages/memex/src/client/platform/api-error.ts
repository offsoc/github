type ApiErrorOpts = {
  status?: number
  code?: string
  name?: string
  contentType?: string
  sourceStack?: string
}

/**
 * Custom error class to help us distinguish non-200 HTTP responses from
 * outright network failures.
 */
export class ApiError extends Error {
  public declare status: number | undefined
  public declare code: string | undefined

  constructor(message: string, opts: ApiErrorOpts = {}) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = toErrorName(opts)
    this.status = opts.status
    this.code = opts.code

    /**
     * If we pass a sourceStack, append the error stack to the sourceStack
     */
    if (opts.sourceStack) {
      if (!this.stack) {
        this.stack = opts.sourceStack
      } else {
        this.stack += `\n${opts.sourceStack.substring(opts.sourceStack.indexOf('\n') + 1)}`
      }
    }
  }
}

type ApiErrorOptsFields = Pick<ApiErrorOpts, 'status' | 'code' | 'name' | 'contentType'>

function toErrorName(opts: ApiErrorOptsFields) {
  const errorNameOpts: ApiErrorOptsFields = {}
  if (opts.status) {
    errorNameOpts['status'] = opts.status
  }
  if (opts.code) {
    errorNameOpts['code'] = opts.code
  }
  if (opts.name) {
    errorNameOpts['name'] = opts.name
  }
  if (opts.contentType) {
    errorNameOpts['contentType'] = opts.contentType
  }

  const baseErrorName = 'ApiError'
  if (Object.keys(errorNameOpts).length > 0) {
    return `${baseErrorName} (${JSON.stringify(errorNameOpts)})`
  } else {
    return baseErrorName
  }
}
