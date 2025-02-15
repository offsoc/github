# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::RepositoryTransfer::State`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::RepositoryTransfer::State`.

module Hydro::Schemas::Github::V1::RepositoryTransfer::State
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::RepositoryTransfer::State::REQUESTED = 1
Hydro::Schemas::Github::V1::RepositoryTransfer::State::RESPONDED = 2
Hydro::Schemas::Github::V1::RepositoryTransfer::State::STATE_UNKNOWN = 0
