# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference`.

class Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference
  sig do
    params(
      graphql_global_relay_id: T.nilable(String),
      graphql_next_global_id: T.nilable(String),
      id: T.nilable(String),
      type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(graphql_global_relay_id: nil, graphql_next_global_id: nil, id: nil, type: nil); end

  sig { void }
  def clear_graphql_global_relay_id; end

  sig { void }
  def clear_graphql_next_global_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_type; end

  sig { returns(String) }
  def graphql_global_relay_id; end

  sig { params(value: String).void }
  def graphql_global_relay_id=(value); end

  sig { returns(String) }
  def graphql_next_global_id; end

  sig { params(value: String).void }
  def graphql_next_global_id=(value); end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
