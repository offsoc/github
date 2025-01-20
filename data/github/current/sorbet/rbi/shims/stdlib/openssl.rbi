# typed: true

class OpenSSL::HMAC
  sig do
    params(
      digest: T.any(OpenSSL::Digest, String),
      key: String,
      data: String,
    ).returns(String)
  end
  def self.base64digest(digest, key, data); end
end
