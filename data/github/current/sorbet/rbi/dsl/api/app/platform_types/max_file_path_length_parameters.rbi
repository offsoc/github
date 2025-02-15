# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MaxFilePathLengthParameters`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MaxFilePathLengthParameters`.

class Api::App::PlatformTypes::MaxFilePathLengthParameters < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def max_file_path_length; end

  sig { returns(T::Boolean) }
  def max_file_path_length?; end
end
