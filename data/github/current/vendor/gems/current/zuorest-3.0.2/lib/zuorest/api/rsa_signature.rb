module Zuorest::RSASignature
  def create_rsa_signature(body, headers = {})
    post("/v1/rsa-signatures", body:, headers:)
  end
end
