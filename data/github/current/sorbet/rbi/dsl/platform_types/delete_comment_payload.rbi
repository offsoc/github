# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DeleteCommentPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DeleteCommentPayload`.

class PlatformTypes::DeleteCommentPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def comment; end

  sig { returns(T::Boolean) }
  def comment?; end
end
