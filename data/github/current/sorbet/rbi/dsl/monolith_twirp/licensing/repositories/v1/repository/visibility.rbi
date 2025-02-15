# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility`.

module MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_INTERNAL = 3
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_INVALID = 0
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_PRIVATE = 2
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_PUBLIC = 1
