# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Spokes::Repository::RepositoryType`.
# Please instead update this file by running `bin/tapioca dsl Spokes::Repository::RepositoryType`.

module Spokes::Repository::RepositoryType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Spokes::Repository::RepositoryType::GIST = 3
Spokes::Repository::RepositoryType::NETWORK = 4
Spokes::Repository::RepositoryType::REPO = 1
Spokes::Repository::RepositoryType::UNKNOWN = 0
Spokes::Repository::RepositoryType::WIKI = 2
