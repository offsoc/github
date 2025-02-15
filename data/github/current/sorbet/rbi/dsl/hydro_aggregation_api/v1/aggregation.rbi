# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `HydroAggregationApi::V1::Aggregation`.
# Please instead update this file by running `bin/tapioca dsl HydroAggregationApi::V1::Aggregation`.

class HydroAggregationApi::V1::Aggregation
  sig { params(name: T.nilable(String), type: T.nilable(T.any(Symbol, Integer))).void }
  def initialize(name: nil, type: nil); end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_type; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
