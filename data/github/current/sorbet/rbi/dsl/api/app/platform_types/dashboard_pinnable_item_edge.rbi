# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::DashboardPinnableItemEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::DashboardPinnableItemEdge`.

class Api::App::PlatformTypes::DashboardPinnableItemEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::Gist, Api::App::PlatformTypes::Repository, Api::App::PlatformTypes::Issue, Api::App::PlatformTypes::Project, Api::App::PlatformTypes::PullRequest, Api::App::PlatformTypes::User, Api::App::PlatformTypes::Organization, Api::App::PlatformTypes::Team)))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
