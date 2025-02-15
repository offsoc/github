# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::NewConfigTrigger`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::NewConfigTrigger`.

module Turboscan::Proto::NewConfigTrigger
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Turboscan::Proto::NewConfigTrigger::LANGUAGES_CHANGE = 1
Turboscan::Proto::NewConfigTrigger::MANUAL = 0
Turboscan::Proto::NewConfigTrigger::TEMPLATE_UPGRADE = 2
