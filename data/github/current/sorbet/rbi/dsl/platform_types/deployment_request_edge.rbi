# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DeploymentRequestEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DeploymentRequestEdge`.

class PlatformTypes::DeploymentRequestEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(PlatformTypes::DeploymentRequest)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
