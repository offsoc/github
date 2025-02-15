# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::IPAddress`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::IPAddress`.

class Hydro::Schemas::Github::V1::Entities::IPAddress
  sig do
    params(
      address: T.nilable(String),
      v4_int: T.untyped,
      v6_int: T.nilable(String),
      version: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(address: nil, v4_int: nil, v6_int: nil, version: nil); end

  sig { returns(String) }
  def address; end

  sig { params(value: String).void }
  def address=(value); end

  sig { void }
  def clear_address; end

  sig { void }
  def clear_v4_int; end

  sig { void }
  def clear_v6_int; end

  sig { void }
  def clear_version; end

  sig { returns(T.untyped) }
  def v4_int; end

  sig { params(value: T.untyped).void }
  def v4_int=(value); end

  sig { returns(String) }
  def v6_int; end

  sig { params(value: String).void }
  def v6_int=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def version; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def version=(value); end
end
