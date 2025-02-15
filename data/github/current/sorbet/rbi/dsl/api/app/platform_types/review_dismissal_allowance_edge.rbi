# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ReviewDismissalAllowanceEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ReviewDismissalAllowanceEdge`.

class Api::App::PlatformTypes::ReviewDismissalAllowanceEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ReviewDismissalAllowance)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
