# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::Tag`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::Tag`.

class Aqueduct::Api::V1::Tag
  sig { params(name: T.nilable(String), value: T.nilable(String)).void }
  def initialize(name: nil, value: nil); end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_value; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def value; end

  sig { params(value: String).void }
  def value=(value); end
end
