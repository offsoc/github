# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CreateTeamDiscussionPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CreateTeamDiscussionPayload`.

class PlatformTypes::CreateTeamDiscussionPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::TeamDiscussion)) }
  def team_discussion; end

  sig { returns(T::Boolean) }
  def team_discussion?; end
end
