# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencyGraphPlatform::RepoInsights::V1::Dependency`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencyGraphPlatform::RepoInsights::V1::Dependency`.

class Github::DependencyGraphPlatform::RepoInsights::V1::Dependency
  sig do
    params(
      ecosystem: T.nilable(T.any(Symbol, Integer)),
      manifest_path: T.nilable(String),
      package_license: T.nilable(String),
      package_name: T.nilable(String),
      relationship: T.nilable(T.any(Symbol, Integer)),
      requirements: T.nilable(String),
      scanned_at: T.nilable(Google::Protobuf::Timestamp),
      scope: T.nilable(T.any(Symbol, Integer)),
      vulnerable_version_range_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))
    ).void
  end
  def initialize(ecosystem: nil, manifest_path: nil, package_license: nil, package_name: nil, relationship: nil, requirements: nil, scanned_at: nil, scope: nil, vulnerable_version_range_ids: T.unsafe(nil)); end

  sig { void }
  def clear_ecosystem; end

  sig { void }
  def clear_manifest_path; end

  sig { void }
  def clear_package_license; end

  sig { void }
  def clear_package_name; end

  sig { void }
  def clear_relationship; end

  sig { void }
  def clear_requirements; end

  sig { void }
  def clear_scanned_at; end

  sig { void }
  def clear_scope; end

  sig { void }
  def clear_vulnerable_version_range_ids; end

  sig { returns(T.any(Symbol, Integer)) }
  def ecosystem; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def ecosystem=(value); end

  sig { returns(String) }
  def manifest_path; end

  sig { params(value: String).void }
  def manifest_path=(value); end

  sig { returns(String) }
  def package_license; end

  sig { params(value: String).void }
  def package_license=(value); end

  sig { returns(String) }
  def package_name; end

  sig { params(value: String).void }
  def package_name=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def relationship; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def relationship=(value); end

  sig { returns(String) }
  def requirements; end

  sig { params(value: String).void }
  def requirements=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def scanned_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def scanned_at=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def scope; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def scope=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def vulnerable_version_range_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def vulnerable_version_range_ids=(value); end
end
