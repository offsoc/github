# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Users::V1::BusinessSelector`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Users::V1::BusinessSelector`.

class GitHub::Proto::SecretScanning::Users::V1::BusinessSelector
  sig { params(id: T.nilable(Integer)).void }
  def initialize(id: nil); end

  sig { void }
  def clear_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
