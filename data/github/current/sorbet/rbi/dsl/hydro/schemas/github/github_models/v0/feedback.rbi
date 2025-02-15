# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::GithubModels::V0::Feedback`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::GithubModels::V0::Feedback`.

class Hydro::Schemas::Github::GithubModels::V0::Feedback
  sig do
    params(
      can_be_contacted: T.nilable(T::Boolean),
      content: T.nilable(String),
      feedback_choice: T.nilable(T.any(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)], T::Array[T.any(Symbol, Integer)])),
      feedback_type: T.nilable(T.any(Symbol, Integer)),
      model: T.nilable(String),
      user: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(can_be_contacted: nil, content: nil, feedback_choice: T.unsafe(nil), feedback_type: nil, model: nil, user: nil); end

  sig { returns(T::Boolean) }
  def can_be_contacted; end

  sig { params(value: T::Boolean).void }
  def can_be_contacted=(value); end

  sig { void }
  def clear_can_be_contacted; end

  sig { void }
  def clear_content; end

  sig { void }
  def clear_feedback_choice; end

  sig { void }
  def clear_feedback_type; end

  sig { void }
  def clear_model; end

  sig { void }
  def clear_user; end

  sig { returns(String) }
  def content; end

  sig { params(value: String).void }
  def content=(value); end

  sig { returns(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]) }
  def feedback_choice; end

  sig { params(value: Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]).void }
  def feedback_choice=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def feedback_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def feedback_type=(value); end

  sig { returns(String) }
  def model; end

  sig { params(value: String).void }
  def model=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def user; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def user=(value); end
end
