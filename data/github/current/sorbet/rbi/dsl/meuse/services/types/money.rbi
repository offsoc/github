# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Meuse::Services::Types::Money`.
# Please instead update this file by running `bin/tapioca dsl Meuse::Services::Types::Money`.

class Meuse::Services::Types::Money
  sig { params(currency_code: T.nilable(String), subunits: T.nilable(Integer)).void }
  def initialize(currency_code: nil, subunits: nil); end

  sig { void }
  def clear_currency_code; end

  sig { void }
  def clear_subunits; end

  sig { returns(String) }
  def currency_code; end

  sig { params(value: String).void }
  def currency_code=(value); end

  sig { returns(Integer) }
  def subunits; end

  sig { params(value: Integer).void }
  def subunits=(value); end
end
