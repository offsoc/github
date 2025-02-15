# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType`.

module Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::BUY_ME_A_COFFEE = 13
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::COMMUNITY_BRIDGE = 7
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::CUSTOM = 1
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::GITHUB = 6
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::ISSUEHUNT = 8
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::KO_FI = 4
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::LFX_CROWDFUNDING = 11
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::LIBERAPAY = 9
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::OPEN_COLLECTIVE = 3
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::OTECHIE = 10
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::PATREON = 2
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::PLATFORM_UNKNOWN = 0
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::POLAR = 12
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::THANKS_DEV = 14
Hydro::Schemas::Github::V1::Entities::FundingPlatform::PlatformType::TIDELIFT = 5
