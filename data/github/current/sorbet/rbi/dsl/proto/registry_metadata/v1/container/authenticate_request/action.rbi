# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Container::AuthenticateRequest::Action`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Container::AuthenticateRequest::Action`.

module Proto::RegistryMetadata::V1::Container::AuthenticateRequest::Action
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Proto::RegistryMetadata::V1::Container::AuthenticateRequest::Action::READ_PACKAGE = 0
Proto::RegistryMetadata::V1::Container::AuthenticateRequest::Action::WRITE_PACKAGE = 1
