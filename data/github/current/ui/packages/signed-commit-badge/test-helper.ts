import type {CertificateAttributes, SignatureResult} from './signed-commit-types'

export function createSignatureResult(overrides: Partial<SignatureResult> = {}): SignatureResult {
  const base: SignatureResult = {
    hasSignature: true,
    helpUrl: '/help-url',
    isViewer: false,
    keyExpired: false,
    keyId: '08A088ACEF151AF6',
    keyRevoked: false,
    signedByGitHub: true,
    signerLogin: 'web-flow',
    signerAvatarUrl: '',
    signatureType: 'GpgSignature',
    signatureVerificationReason: 'valid',
    signatureCertificateIssuer: createCertificateAttributes(),
    signatureCertificateSubject: createCertificateAttributes(),
  }

  return {...base, ...overrides}
}

export function createCertificateAttributes(overrides: Partial<CertificateAttributes> = {}): CertificateAttributes {
  const base: CertificateAttributes = {
    common_name: undefined,
    email_address: undefined,
    organization: undefined,
    organization_unit: undefined,
  }

  return {...base, ...overrides}
}
