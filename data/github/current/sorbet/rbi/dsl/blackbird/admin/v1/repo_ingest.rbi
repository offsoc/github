# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Admin::V1::RepoIngest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Admin::V1::RepoIngest`.

class Blackbird::Admin::V1::RepoIngest
  sig do
    params(
      corpus: T.nilable(String),
      epoch_id: T.nilable(Integer),
      snapshot_entries: T.nilable(T.any(Google::Protobuf::RepeatedField[Blackbird::Admin::V1::SnapshotEntry], T::Array[Blackbird::Admin::V1::SnapshotEntry]))
    ).void
  end
  def initialize(corpus: nil, epoch_id: nil, snapshot_entries: T.unsafe(nil)); end

  sig { void }
  def clear_corpus; end

  sig { void }
  def clear_epoch_id; end

  sig { void }
  def clear_snapshot_entries; end

  sig { returns(String) }
  def corpus; end

  sig { params(value: String).void }
  def corpus=(value); end

  sig { returns(Integer) }
  def epoch_id; end

  sig { params(value: Integer).void }
  def epoch_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Blackbird::Admin::V1::SnapshotEntry]) }
  def snapshot_entries; end

  sig { params(value: Google::Protobuf::RepeatedField[Blackbird::Admin::V1::SnapshotEntry]).void }
  def snapshot_entries=(value); end
end
