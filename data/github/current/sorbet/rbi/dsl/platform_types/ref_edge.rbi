# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RefEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RefEdge`.

class PlatformTypes::RefEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(PlatformTypes::Ref)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
