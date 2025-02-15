# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CodeScanningParameters`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CodeScanningParameters`.

class PlatformTypes::CodeScanningParameters < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Array[PlatformTypes::CodeScanningTool]) }
  def code_scanning_tools; end

  sig { returns(T::Boolean) }
  def code_scanning_tools?; end
end
