# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UpdateRepositoryWebCommitSignoffSettingPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UpdateRepositoryWebCommitSignoffSettingPayload`.

class PlatformTypes::UpdateRepositoryWebCommitSignoffSettingPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(String)) }
  def message; end

  sig { returns(T::Boolean) }
  def message?; end

  sig { returns(T.nilable(PlatformTypes::Repository)) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end
end
