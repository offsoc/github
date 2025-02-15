# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::FeatureEnrollmentEvent`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::FeatureEnrollmentEvent`.

class Hydro::Schemas::Github::V1::FeatureEnrollmentEvent
  sig do
    params(
      action: T.nilable(T.any(Symbol, Integer)),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      enrollee_id: T.nilable(Integer),
      enrollee_type: T.nilable(T.any(Symbol, Integer)),
      toggleable_feature: T.nilable(String)
    ).void
  end
  def initialize(action: nil, actor: nil, enrollee_id: nil, enrollee_type: nil, toggleable_feature: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def action; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def action=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_action; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_enrollee_id; end

  sig { void }
  def clear_enrollee_type; end

  sig { void }
  def clear_toggleable_feature; end

  sig { returns(Integer) }
  def enrollee_id; end

  sig { params(value: Integer).void }
  def enrollee_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def enrollee_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def enrollee_type=(value); end

  sig { returns(String) }
  def toggleable_feature; end

  sig { params(value: String).void }
  def toggleable_feature=(value); end
end
