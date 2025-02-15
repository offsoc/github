# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::CodeScanning::Turboghas::V1::UserType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::CodeScanning::Turboghas::V1::UserType`.

module MonolithTwirp::CodeScanning::Turboghas::V1::UserType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::CodeScanning::Turboghas::V1::UserType::USER_TYPE_INVALID = 0
MonolithTwirp::CodeScanning::Turboghas::V1::UserType::USER_TYPE_ORGANIZATION = 1
MonolithTwirp::CodeScanning::Turboghas::V1::UserType::USER_TYPE_USER = 2
