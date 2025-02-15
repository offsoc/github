# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TrackableItemEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TrackableItemEdge`.

class Api::App::PlatformTypes::TrackableItemEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::TrackedDraftItem, Api::App::PlatformTypes::TrackedIssueReference)))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
