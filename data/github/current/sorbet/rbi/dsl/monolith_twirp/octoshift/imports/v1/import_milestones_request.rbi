# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ImportMilestonesRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ImportMilestonesRequest`.

class MonolithTwirp::Octoshift::Imports::V1::ImportMilestonesRequest
  sig do
    params(
      milestones: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Milestone], T::Array[MonolithTwirp::Octoshift::Imports::V1::Milestone])),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(milestones: T.unsafe(nil), repository_id: nil); end

  sig { void }
  def clear_milestones; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Milestone]) }
  def milestones; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Milestone]).void }
  def milestones=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
