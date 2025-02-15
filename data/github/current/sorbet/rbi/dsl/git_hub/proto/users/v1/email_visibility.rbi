# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Users::V1::EmailVisibility`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Users::V1::EmailVisibility`.

module GitHub::Proto::Users::V1::EmailVisibility
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_INVALID = 0
GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_PRIVATE = 2
GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_PUBLIC = 1
