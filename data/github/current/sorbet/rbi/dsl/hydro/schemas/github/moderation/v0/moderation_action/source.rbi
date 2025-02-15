# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source`.

module Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source::DSA_REPORT = 1
Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source::SCAN_DETECTION = 3
Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source::SOURCE_UNKNOWN = 0
Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source::STAFF_DETECTION = 4
Hydro::Schemas::Github::Moderation::V0::ModerationAction::Source::USER_REPORT = 2
