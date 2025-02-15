# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Chat::V1::SecretScanningAlert::OtherLocation`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Chat::V1::SecretScanningAlert::OtherLocation`.

class MonolithTwirp::Copilotapi::Chat::V1::SecretScanningAlert::OtherLocation
  sig { params(number: T.nilable(Integer), type: T.nilable(String), url: T.nilable(String)).void }
  def initialize(number: nil, type: nil, url: nil); end

  sig { void }
  def clear_number; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_url; end

  sig { returns(Integer) }
  def number; end

  sig { params(value: Integer).void }
  def number=(value); end

  sig { returns(String) }
  def type; end

  sig { params(value: String).void }
  def type=(value); end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end
end
