# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Migrator::EmitDownloadEventRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Migrator::EmitDownloadEventRequest`.

class Proto::RegistryMetadata::V1::Migrator::EmitDownloadEventRequest
  sig do
    params(
      ecosystem: T.nilable(T.any(Symbol, Integer)),
      namespace: T.nilable(String),
      package_name: T.nilable(String),
      version_name: T.nilable(String)
    ).void
  end
  def initialize(ecosystem: nil, namespace: nil, package_name: nil, version_name: nil); end

  sig { void }
  def clear_ecosystem; end

  sig { void }
  def clear_namespace; end

  sig { void }
  def clear_package_name; end

  sig { void }
  def clear_version_name; end

  sig { returns(T.any(Symbol, Integer)) }
  def ecosystem; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def ecosystem=(value); end

  sig { returns(String) }
  def namespace; end

  sig { params(value: String).void }
  def namespace=(value); end

  sig { returns(String) }
  def package_name; end

  sig { params(value: String).void }
  def package_name=(value); end

  sig { returns(String) }
  def version_name; end

  sig { params(value: String).void }
  def version_name=(value); end
end
