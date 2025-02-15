# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::ActionPackages::ResolveActionPackageVersionResult`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::ActionPackages::ResolveActionPackageVersionResult`.

class Proto::RegistryMetadata::V1::ActionPackages::ResolveActionPackageVersionResult
  sig do
    params(
      action_ref: T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ActionReference),
      outcome: T.nilable(T.any(Symbol, Integer)),
      resolved_package_version: T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ResolvedActionPackageVersion)
    ).void
  end
  def initialize(action_ref: nil, outcome: nil, resolved_package_version: nil); end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ActionReference)) }
  def action_ref; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ActionReference)).void }
  def action_ref=(value); end

  sig { void }
  def clear_action_ref; end

  sig { void }
  def clear_outcome; end

  sig { void }
  def clear_resolved_package_version; end

  sig { returns(T.any(Symbol, Integer)) }
  def outcome; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def outcome=(value); end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ResolvedActionPackageVersion)) }
  def resolved_package_version; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::ActionPackages::ResolvedActionPackageVersion)).void }
  def resolved_package_version=(value); end
end
