# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PinnedDiscussionEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PinnedDiscussionEdge`.

class Api::App::PlatformTypes::PinnedDiscussionEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::PinnedDiscussion)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
