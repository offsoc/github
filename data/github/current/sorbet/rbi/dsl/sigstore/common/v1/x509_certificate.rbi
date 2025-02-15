# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Sigstore::Common::V1::X509Certificate`.
# Please instead update this file by running `bin/tapioca dsl Sigstore::Common::V1::X509Certificate`.

class Sigstore::Common::V1::X509Certificate
  sig { params(raw_bytes: T.nilable(String)).void }
  def initialize(raw_bytes: nil); end

  sig { void }
  def clear_raw_bytes; end

  sig { returns(String) }
  def raw_bytes; end

  sig { params(value: String).void }
  def raw_bytes=(value); end
end
