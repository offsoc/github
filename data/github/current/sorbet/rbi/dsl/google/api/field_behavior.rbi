# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Google::Api::FieldBehavior`.
# Please instead update this file by running `bin/tapioca dsl Google::Api::FieldBehavior`.

module Google::Api::FieldBehavior
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Google::Api::FieldBehavior::FIELD_BEHAVIOR_UNSPECIFIED = 0
Google::Api::FieldBehavior::IMMUTABLE = 5
Google::Api::FieldBehavior::INPUT_ONLY = 4
Google::Api::FieldBehavior::NON_EMPTY_DEFAULT = 7
Google::Api::FieldBehavior::OPTIONAL = 1
Google::Api::FieldBehavior::OUTPUT_ONLY = 3
Google::Api::FieldBehavior::REQUIRED = 2
Google::Api::FieldBehavior::UNORDERED_LIST = 6
