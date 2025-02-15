# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff`.
# Please instead update this file by running `bin/tapioca dsl DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff`.

class DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff
  sig do
    params(
      dependencies: T.nilable(T.any(Google::Protobuf::RepeatedField[DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff], T::Array[DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff])),
      file_path: T.nilable(String),
      type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(dependencies: T.unsafe(nil), file_path: nil, type: nil); end

  sig { void }
  def clear_dependencies; end

  sig { void }
  def clear_file_path; end

  sig { void }
  def clear_type; end

  sig do
    returns(Google::Protobuf::RepeatedField[DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff])
  end
  def dependencies; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[DependencyGraphAPI::V1::GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff]
    ).void
  end
  def dependencies=(value); end

  sig { returns(String) }
  def file_path; end

  sig { params(value: String).void }
  def file_path=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
