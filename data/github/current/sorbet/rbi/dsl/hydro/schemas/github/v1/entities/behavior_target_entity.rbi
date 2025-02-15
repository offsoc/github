# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::BehaviorTargetEntity`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::BehaviorTargetEntity`.

class Hydro::Schemas::Github::V1::Entities::BehaviorTargetEntity
  sig do
    params(
      entity_id: T.nilable(Integer),
      entity_type: T.nilable(T.any(Symbol, Integer)),
      parent_entity_id: T.nilable(Integer),
      parent_entity_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(entity_id: nil, entity_type: nil, parent_entity_id: nil, parent_entity_type: nil); end

  sig { void }
  def clear_entity_id; end

  sig { void }
  def clear_entity_type; end

  sig { void }
  def clear_parent_entity_id; end

  sig { void }
  def clear_parent_entity_type; end

  sig { returns(Integer) }
  def entity_id; end

  sig { params(value: Integer).void }
  def entity_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def entity_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def entity_type=(value); end

  sig { returns(Integer) }
  def parent_entity_id; end

  sig { params(value: Integer).void }
  def parent_entity_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def parent_entity_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def parent_entity_type=(value); end
end
