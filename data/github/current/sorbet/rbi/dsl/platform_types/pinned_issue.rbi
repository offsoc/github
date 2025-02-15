# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::PinnedIssue`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::PinnedIssue`.

class PlatformTypes::PinnedIssue < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def full_database_id; end

  sig { returns(T::Boolean) }
  def full_database_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(PlatformTypes::Issue) }
  def issue; end

  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def pinned_by; end

  sig { returns(T::Boolean) }
  def pinned_by?; end

  sig { returns(PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end
end
