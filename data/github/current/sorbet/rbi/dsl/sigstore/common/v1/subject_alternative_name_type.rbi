# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Sigstore::Common::V1::SubjectAlternativeNameType`.
# Please instead update this file by running `bin/tapioca dsl Sigstore::Common::V1::SubjectAlternativeNameType`.

module Sigstore::Common::V1::SubjectAlternativeNameType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Sigstore::Common::V1::SubjectAlternativeNameType::EMAIL = 1
Sigstore::Common::V1::SubjectAlternativeNameType::OTHER_NAME = 3
Sigstore::Common::V1::SubjectAlternativeNameType::SUBJECT_ALTERNATIVE_NAME_TYPE_UNSPECIFIED = 0
Sigstore::Common::V1::SubjectAlternativeNameType::URI = 2
