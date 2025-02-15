# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Google::Protobuf::NullValue`.
# Please instead update this file by running `bin/tapioca dsl Google::Protobuf::NullValue`.

module Google::Protobuf::NullValue
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Google::Protobuf::NullValue::NULL_VALUE = 0
