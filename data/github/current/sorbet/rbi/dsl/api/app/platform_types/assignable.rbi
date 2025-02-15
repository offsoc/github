# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Assignable`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Assignable`.

class Api::App::PlatformTypes::Assignable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::UserConnection) }
  def assignees; end

  sig { returns(T::Boolean) }
  def assignees?; end

  sig { returns(Api::App::PlatformTypes::UserConnection) }
  def suggested_assignees; end

  sig { returns(T::Boolean) }
  def suggested_assignees?; end

  sig { returns(T::Boolean) }
  def viewer_can_assign; end

  sig { returns(T::Boolean) }
  def viewer_can_assign?; end
end
