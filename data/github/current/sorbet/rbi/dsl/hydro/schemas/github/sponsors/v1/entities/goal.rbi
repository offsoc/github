# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::Entities::Goal`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::Entities::Goal`.

class Hydro::Schemas::Github::Sponsors::V1::Entities::Goal
  sig do
    params(
      description: T.nilable(String),
      id: T.nilable(Integer),
      kind: T.nilable(T.any(Symbol, Integer)),
      state: T.nilable(T.any(Symbol, Integer)),
      target_value: T.nilable(Integer)
    ).void
  end
  def initialize(description: nil, id: nil, kind: nil, state: nil, target_value: nil); end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_kind; end

  sig { void }
  def clear_state; end

  sig { void }
  def clear_target_value; end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def kind; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def kind=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def state; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def state=(value); end

  sig { returns(Integer) }
  def target_value; end

  sig { params(value: Integer).void }
  def target_value=(value); end
end
