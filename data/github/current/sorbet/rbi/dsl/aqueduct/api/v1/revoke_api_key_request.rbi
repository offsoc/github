# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::RevokeApiKeyRequest`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::RevokeApiKeyRequest`.

class Aqueduct::Api::V1::RevokeApiKeyRequest
  sig { params(app: T.nilable(String), version: T.nilable(Integer)).void }
  def initialize(app: nil, version: nil); end

  sig { returns(String) }
  def app; end

  sig { params(value: String).void }
  def app=(value); end

  sig { void }
  def clear_app; end

  sig { void }
  def clear_version; end

  sig { returns(Integer) }
  def version; end

  sig { params(value: Integer).void }
  def version=(value); end
end
