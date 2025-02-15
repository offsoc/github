# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::AlertStateFilter`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::AlertStateFilter`.

module Turboscan::Proto::AlertStateFilter
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_ALL = 1
Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_CLOSED = 3
Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_CLOSED_FIXED = 5
Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_CLOSED_RESOLVED = 4
Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_NONE = 0
Turboscan::Proto::AlertStateFilter::ALERT_STATE_FILTER_OPEN = 2
