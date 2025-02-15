# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::GitSignatureState`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::GitSignatureState`.

module PlatformTypes::GitSignatureState
  sig { returns(T::Boolean) }
  def bad_cert?; end

  sig { returns(T::Boolean) }
  def bad_email?; end

  sig { returns(T::Boolean) }
  def expired_key?; end

  sig { returns(T::Boolean) }
  def gpgverify_error?; end

  sig { returns(T::Boolean) }
  def gpgverify_unavailable?; end

  sig { returns(T::Boolean) }
  def invalid?; end

  sig { returns(T::Boolean) }
  def malformed_sig?; end

  sig { returns(T::Boolean) }
  def no_user?; end

  sig { returns(T::Boolean) }
  def not_signing_key?; end

  sig { returns(T::Boolean) }
  def ocsp_error?; end

  sig { returns(T::Boolean) }
  def ocsp_pending?; end

  sig { returns(T::Boolean) }
  def ocsp_revoked?; end

  sig { returns(T::Boolean) }
  def unknown_key?; end

  sig { returns(T::Boolean) }
  def unknown_sig_type?; end

  sig { returns(T::Boolean) }
  def unsigned?; end

  sig { returns(T::Boolean) }
  def unverified_email?; end

  sig { returns(T::Boolean) }
  def valid?; end

  BAD_CERT = T.let("BAD_CERT", String)
  BAD_EMAIL = T.let("BAD_EMAIL", String)
  EXPIRED_KEY = T.let("EXPIRED_KEY", String)
  GPGVERIFY_ERROR = T.let("GPGVERIFY_ERROR", String)
  GPGVERIFY_UNAVAILABLE = T.let("GPGVERIFY_UNAVAILABLE", String)
  INVALID = T.let("INVALID", String)
  MALFORMED_SIG = T.let("MALFORMED_SIG", String)
  NOT_SIGNING_KEY = T.let("NOT_SIGNING_KEY", String)
  NO_USER = T.let("NO_USER", String)
  OCSP_ERROR = T.let("OCSP_ERROR", String)
  OCSP_PENDING = T.let("OCSP_PENDING", String)
  OCSP_REVOKED = T.let("OCSP_REVOKED", String)
  UNKNOWN_KEY = T.let("UNKNOWN_KEY", String)
  UNKNOWN_SIG_TYPE = T.let("UNKNOWN_SIG_TYPE", String)
  UNSIGNED = T.let("UNSIGNED", String)
  UNVERIFIED_EMAIL = T.let("UNVERIFIED_EMAIL", String)
  VALID = T.let("VALID", String)
end
