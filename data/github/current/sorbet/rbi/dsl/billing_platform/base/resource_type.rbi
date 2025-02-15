# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Base::ResourceType`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Base::ResourceType`.

module BillingPlatform::Base::ResourceType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

BillingPlatform::Base::ResourceType::CostCenterResource = 6
BillingPlatform::Base::ResourceType::CustomerResource = 7
BillingPlatform::Base::ResourceType::Enterprise = 5
BillingPlatform::Base::ResourceType::NoTarget = 0
BillingPlatform::Base::ResourceType::Org = 4
BillingPlatform::Base::ResourceType::Repo = 3
BillingPlatform::Base::ResourceType::Team = 2
BillingPlatform::Base::ResourceType::User = 1
