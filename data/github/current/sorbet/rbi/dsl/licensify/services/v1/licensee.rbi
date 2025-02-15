# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensify::Services::V1::Licensee`.
# Please instead update this file by running `bin/tapioca dsl Licensify::Services::V1::Licensee`.

class Licensify::Services::V1::Licensee
  sig { params(globalId: T.nilable(String), id: T.nilable(Integer), type: T.nilable(T.any(Symbol, Integer))).void }
  def initialize(globalId: nil, id: nil, type: nil); end

  sig { void }
  def clear_globalId; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_type; end

  sig { returns(String) }
  def globalId; end

  sig { params(value: String).void }
  def globalId=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
