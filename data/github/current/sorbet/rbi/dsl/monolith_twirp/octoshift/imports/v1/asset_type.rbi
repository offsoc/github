# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::AssetType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::AssetType`.

module MonolithTwirp::Octoshift::Imports::V1::AssetType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Octoshift::Imports::V1::AssetType::ASSET_TYPE_AUTO = 1
MonolithTwirp::Octoshift::Imports::V1::AssetType::ASSET_TYPE_INVALID = 0
MonolithTwirp::Octoshift::Imports::V1::AssetType::ASSET_TYPE_RELEASE_ASSET = 4
MonolithTwirp::Octoshift::Imports::V1::AssetType::ASSET_TYPE_REPOSITORY_FILE = 3
MonolithTwirp::Octoshift::Imports::V1::AssetType::ASSET_TYPE_USER_ASSET = 2
