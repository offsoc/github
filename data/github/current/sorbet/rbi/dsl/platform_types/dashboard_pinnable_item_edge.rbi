# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DashboardPinnableItemEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DashboardPinnableItemEdge`.

class PlatformTypes::DashboardPinnableItemEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.nilable(T.any(PlatformTypes::Gist, PlatformTypes::Repository, PlatformTypes::Issue, PlatformTypes::Project, PlatformTypes::PullRequest, PlatformTypes::User, PlatformTypes::Organization, PlatformTypes::Team)))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
