# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DeclineTopicSuggestionPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DeclineTopicSuggestionPayload`.

class PlatformTypes::DeclineTopicSuggestionPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::Topic)) }
  def topic; end

  sig { returns(T::Boolean) }
  def topic?; end
end
