//  Get document's HTML Safe nonce.
//
// Example:
//
//   <meta name="html-safe-nonce" content="de43a1f355c711f7f705e4f971964391ac0c8e13">
export function getDocumentHtmlSafeNonces(document: Document): string[] {
  const nonces = [...document.querySelectorAll<HTMLMetaElement>('meta[name=html-safe-nonce]')].map(meta => meta.content)

  if (nonces.length < 1) {
    throw new Error('could not find html-safe-nonce on document')
  }
  return nonces
}

interface Response {
  headers: Headers
  status: number
}

class ResponseError extends Error {
  response: Response

  constructor(message: string, response: Response) {
    super(`${message} for HTTP ${response.status}`)
    this.response = response
  }
}

export function verifyResponseHtmlSafeNonce(nonces: string[], response: Response, allowJson = false) {
  const contentType = response.headers.get('content-type') || ''
  if (!allowJson && !contentType.startsWith('text/html')) {
    throw new ResponseError(`expected response with text/html, but was ${contentType}`, response)
  }

  if (allowJson && !(contentType.startsWith('text/html') || contentType.startsWith('application/json'))) {
    throw new ResponseError(`expected response with text/html or application/json, but was ${contentType}`, response)
  }

  const responseNonce = response.headers.get('x-html-safe')
  if (!responseNonce) {
    throw new ResponseError(`missing X-HTML-Safe nonce`, response)
  } else if (!nonces.includes(responseNonce)) {
    throw new ResponseError(`response X-HTML-Safe nonce did not match`, response)
  }
}
