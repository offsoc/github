# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::WorkflowsParameters`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::WorkflowsParameters`.

class PlatformTypes::WorkflowsParameters < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def do_not_enforce_on_create; end

  sig { returns(T::Boolean) }
  def do_not_enforce_on_create?; end

  sig { returns(T::Array[PlatformTypes::WorkflowFileReference]) }
  def workflows; end

  sig { returns(T::Boolean) }
  def workflows?; end
end
