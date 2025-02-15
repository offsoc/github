# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MaxFileSizeParameters`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MaxFileSizeParameters`.

class PlatformTypes::MaxFileSizeParameters < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def max_file_size; end

  sig { returns(T::Boolean) }
  def max_file_size?; end
end
