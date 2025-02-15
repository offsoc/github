# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::DisableResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::DisableResponse`.

class Turboscan::Proto::DisableResponse
  sig { params(noop: T.nilable(T::Boolean)).void }
  def initialize(noop: nil); end

  sig { void }
  def clear_noop; end

  sig { returns(T::Boolean) }
  def noop; end

  sig { params(value: T::Boolean).void }
  def noop=(value); end
end
