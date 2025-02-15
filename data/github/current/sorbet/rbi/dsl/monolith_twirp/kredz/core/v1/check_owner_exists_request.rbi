# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Kredz::Core::V1::CheckOwnerExistsRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Kredz::Core::V1::CheckOwnerExistsRequest`.

class MonolithTwirp::Kredz::Core::V1::CheckOwnerExistsRequest
  sig { params(owner_global_id: T.nilable(MonolithTwirp::Kredz::Core::V1::GlobalID)).void }
  def initialize(owner_global_id: nil); end

  sig { void }
  def clear_owner_global_id; end

  sig { returns(T.nilable(MonolithTwirp::Kredz::Core::V1::GlobalID)) }
  def owner_global_id; end

  sig { params(value: T.nilable(MonolithTwirp::Kredz::Core::V1::GlobalID)).void }
  def owner_global_id=(value); end
end
