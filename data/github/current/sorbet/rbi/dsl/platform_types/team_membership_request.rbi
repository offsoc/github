# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TeamMembershipRequest`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TeamMembershipRequest`.

class PlatformTypes::TeamMembershipRequest < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def requester; end

  sig { returns(T::Boolean) }
  def requester?; end
end
