# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::MilestoneError`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::MilestoneError`.

class MonolithTwirp::Octoshift::Imports::V1::MilestoneError
  sig do
    params(
      error_list: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      milestone: T.nilable(MonolithTwirp::Octoshift::Imports::V1::Milestone)
    ).void
  end
  def initialize(error_list: T.unsafe(nil), milestone: nil); end

  sig { void }
  def clear_error_list; end

  sig { void }
  def clear_milestone; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def error_list; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def error_list=(value); end

  sig { returns(T.nilable(MonolithTwirp::Octoshift::Imports::V1::Milestone)) }
  def milestone; end

  sig { params(value: T.nilable(MonolithTwirp::Octoshift::Imports::V1::Milestone)).void }
  def milestone=(value); end
end
