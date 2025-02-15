# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ImportLabelsRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ImportLabelsRequest`.

class MonolithTwirp::Octoshift::Imports::V1::ImportLabelsRequest
  sig do
    params(
      labels: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Label], T::Array[MonolithTwirp::Octoshift::Imports::V1::Label])),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(labels: T.unsafe(nil), repository_id: nil); end

  sig { void }
  def clear_labels; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Label]) }
  def labels; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Octoshift::Imports::V1::Label]).void }
  def labels=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
