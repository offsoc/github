# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CWEEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CWEEdge`.

class PlatformTypes::CWEEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(PlatformTypes::CWE)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
