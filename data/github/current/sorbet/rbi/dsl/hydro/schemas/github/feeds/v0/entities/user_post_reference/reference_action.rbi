# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference::ReferenceAction`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference::ReferenceAction`.

module Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference::ReferenceAction
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference::ReferenceAction::MENTION = 1
Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference::ReferenceAction::UNKNOWN_REFERENCE_ACTION = 0
