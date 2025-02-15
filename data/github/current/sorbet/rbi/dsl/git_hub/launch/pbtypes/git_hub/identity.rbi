# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Pbtypes::GitHub::Identity`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Pbtypes::GitHub::Identity`.

class GitHub::Launch::Pbtypes::GitHub::Identity
  sig { params(global_id: T.nilable(String)).void }
  def initialize(global_id: nil); end

  sig { void }
  def clear_global_id; end

  sig { returns(String) }
  def global_id; end

  sig { params(value: String).void }
  def global_id=(value); end
end
