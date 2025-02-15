# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::BypassPullRequestAllowanceConnection`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::BypassPullRequestAllowanceConnection`.

class PlatformTypes::BypassPullRequestAllowanceConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[PlatformTypes::BypassPullRequestAllowanceEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::BypassPullRequestAllowance])) }
  def nodes; end

  sig { returns(T::Boolean) }
  def nodes?; end

  sig { returns(PlatformTypes::PageInfo) }
  def page_info; end

  sig { returns(T::Boolean) }
  def page_info?; end

  sig { returns(Integer) }
  def total_count; end

  sig { returns(T::Boolean) }
  def total_count?; end
end
