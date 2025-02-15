# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Largerrunners::ListImageDefinitionsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Largerrunners::ListImageDefinitionsRequest`.

class GitHub::Launch::Services::Largerrunners::ListImageDefinitionsRequest
  sig { params(owner_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def initialize(owner_id: nil); end

  sig { void }
  def clear_owner_id; end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def owner_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def owner_id=(value); end
end
