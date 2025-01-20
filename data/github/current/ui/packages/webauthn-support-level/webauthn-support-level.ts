import {supported as webauthnSupported} from '@github/webauthn-json/browser-ponyfill'

// Note: the default feedback value stored in the form is 'unknown', but that
// should not be used unless the JS fails to run.
type WebauthnSupportLevel = 'supported' | 'unsupported'

// Calculates a string value to send to the server.
export function webauthnSupportLevel(): WebauthnSupportLevel {
  return webauthnSupported() ? 'supported' : 'unsupported'
}

// Calculates a string value to send to the server.
export async function iuvpaaSupportLevel(): Promise<WebauthnSupportLevel> {
  if (await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()) {
    return 'supported'
  }
  return 'unsupported'
}
