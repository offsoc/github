# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Google::Protobuf::UInt32Value`.
# Please instead update this file by running `bin/tapioca dsl Google::Protobuf::UInt32Value`.

class Google::Protobuf::UInt32Value
  sig { params(value: T.nilable(Integer)).void }
  def initialize(value: nil); end

  sig { void }
  def clear_value; end

  sig { returns(Integer) }
  def value; end

  sig { params(value: Integer).void }
  def value=(value); end
end
