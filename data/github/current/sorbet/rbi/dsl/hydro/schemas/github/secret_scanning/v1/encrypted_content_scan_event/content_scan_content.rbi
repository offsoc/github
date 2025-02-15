# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::SecretScanning::V1::EncryptedContentScanEvent::ContentScanContent`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::SecretScanning::V1::EncryptedContentScanEvent::ContentScanContent`.

class Hydro::Schemas::Github::SecretScanning::V1::EncryptedContentScanEvent::ContentScanContent
  sig do
    params(
      content: T.nilable(String),
      content_type: T.nilable(T.any(Symbol, Integer)),
      deprecated_content_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(content: nil, content_type: nil, deprecated_content_type: nil); end

  sig { void }
  def clear_content; end

  sig { void }
  def clear_content_type; end

  sig { void }
  def clear_deprecated_content_type; end

  sig { returns(String) }
  def content; end

  sig { params(value: String).void }
  def content=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def content_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def content_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def deprecated_content_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def deprecated_content_type=(value); end
end
