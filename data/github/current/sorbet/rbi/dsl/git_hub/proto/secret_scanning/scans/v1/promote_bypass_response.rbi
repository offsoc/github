# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Scans::V1::PromoteBypassResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Scans::V1::PromoteBypassResponse`.

class GitHub::Proto::SecretScanning::Scans::V1::PromoteBypassResponse
  sig { params(bypass: T.nilable(GitHub::Proto::SecretScanning::Scans::V1::Bypass)).void }
  def initialize(bypass: nil); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Scans::V1::Bypass)) }
  def bypass; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Scans::V1::Bypass)).void }
  def bypass=(value); end

  sig { void }
  def clear_bypass; end
end
