# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::TokenGroup::TokenMember`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::TokenGroup::TokenMember`.

class GitHub::Proto::SecretScanning::Api::V2::TokenGroup::TokenMember
  sig { params(label: T.nilable(String), number: T.nilable(Integer)).void }
  def initialize(label: nil, number: nil); end

  sig { void }
  def clear_label; end

  sig { void }
  def clear_number; end

  sig { returns(String) }
  def label; end

  sig { params(value: String).void }
  def label=(value); end

  sig { returns(Integer) }
  def number; end

  sig { params(value: Integer).void }
  def number=(value); end
end
