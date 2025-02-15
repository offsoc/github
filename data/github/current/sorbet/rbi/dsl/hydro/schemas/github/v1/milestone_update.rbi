# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::MilestoneUpdate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::MilestoneUpdate`.

class Hydro::Schemas::Github::V1::MilestoneUpdate
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      milestone: T.nilable(Hydro::Schemas::Github::V1::Entities::Milestone),
      previous_description: T.nilable(String),
      previous_due_on: T.nilable(Google::Protobuf::Timestamp),
      previous_state: T.nilable(String),
      previous_title: T.nilable(String)
    ).void
  end
  def initialize(actor: nil, milestone: nil, previous_description: nil, previous_due_on: nil, previous_state: nil, previous_title: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_milestone; end

  sig { void }
  def clear_previous_description; end

  sig { void }
  def clear_previous_due_on; end

  sig { void }
  def clear_previous_state; end

  sig { void }
  def clear_previous_title; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Milestone)) }
  def milestone; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Milestone)).void }
  def milestone=(value); end

  sig { returns(String) }
  def previous_description; end

  sig { params(value: String).void }
  def previous_description=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def previous_due_on; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def previous_due_on=(value); end

  sig { returns(String) }
  def previous_state; end

  sig { params(value: String).void }
  def previous_state=(value); end

  sig { returns(String) }
  def previous_title; end

  sig { params(value: String).void }
  def previous_title=(value); end
end
