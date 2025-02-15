# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::GetRepositoriesRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::GetRepositoriesRequest`.

class MonolithTwirp::Actions::Core::V1::GetRepositoriesRequest
  sig { params(owner_id: T.nilable(Integer)).void }
  def initialize(owner_id: nil); end

  sig { void }
  def clear_owner_id; end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end
end
