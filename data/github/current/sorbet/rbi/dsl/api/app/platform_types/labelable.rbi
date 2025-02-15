# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Labelable`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Labelable`.

class Api::App::PlatformTypes::Labelable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::LabelConnection)) }
  def labels; end

  sig { returns(T::Boolean) }
  def labels?; end

  sig { returns(T::Boolean) }
  def viewer_can_label; end

  sig { returns(T::Boolean) }
  def viewer_can_label?; end
end
