# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Types::V1::SockstatKV`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Types::V1::SockstatKV`.

class GitHub::Spokes::Proto::Types::V1::SockstatKV
  sig do
    params(
      bool_value: T.nilable(T::Boolean),
      bytes_value: T.nilable(String),
      int64_value: T.nilable(Integer),
      key: T.nilable(String),
      uint64_value: T.nilable(Integer)
    ).void
  end
  def initialize(bool_value: nil, bytes_value: nil, int64_value: nil, key: nil, uint64_value: nil); end

  sig { returns(T::Boolean) }
  def bool_value; end

  sig { params(value: T::Boolean).void }
  def bool_value=(value); end

  sig { returns(String) }
  def bytes_value; end

  sig { params(value: String).void }
  def bytes_value=(value); end

  sig { void }
  def clear_bool_value; end

  sig { void }
  def clear_bytes_value; end

  sig { void }
  def clear_int64_value; end

  sig { void }
  def clear_key; end

  sig { void }
  def clear_uint64_value; end

  sig { returns(Integer) }
  def int64_value; end

  sig { params(value: Integer).void }
  def int64_value=(value); end

  sig { returns(String) }
  def key; end

  sig { params(value: String).void }
  def key=(value); end

  sig { returns(Integer) }
  def uint64_value; end

  sig { params(value: Integer).void }
  def uint64_value=(value); end

  sig { returns(T.nilable(Symbol)) }
  def value; end
end
