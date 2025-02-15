# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependencyGraphAPI::V1::ExcludeDependencySnapshotsResponse`.
# Please instead update this file by running `bin/tapioca dsl DependencyGraphAPI::V1::ExcludeDependencySnapshotsResponse`.

class DependencyGraphAPI::V1::ExcludeDependencySnapshotsResponse
  sig do
    params(
      excluded_snapshot_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))
    ).void
  end
  def initialize(excluded_snapshot_ids: T.unsafe(nil)); end

  sig { void }
  def clear_excluded_snapshot_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def excluded_snapshot_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def excluded_snapshot_ids=(value); end
end
