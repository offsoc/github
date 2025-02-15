# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DeleteProjectColumnPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DeleteProjectColumnPayload`.

class PlatformTypes::DeleteProjectColumnPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(T.any(String, Integer))) }
  def deleted_column_id; end

  sig { returns(T::Boolean) }
  def deleted_column_id?; end

  sig { returns(T.nilable(PlatformTypes::Project)) }
  def project; end

  sig { returns(T::Boolean) }
  def project?; end
end
