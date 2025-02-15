# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::HostedComputeIms::AdminApi::UpdateCuratedImageVersionRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::HostedComputeIms::AdminApi::UpdateCuratedImageVersionRequest`.

class GitHub::HostedComputeIms::AdminApi::UpdateCuratedImageVersionRequest
  sig do
    params(
      enabled: T.nilable(T::Boolean),
      image_definition_id: T.nilable(Integer),
      version: T.nilable(String)
    ).void
  end
  def initialize(enabled: nil, image_definition_id: nil, version: nil); end

  sig { void }
  def clear_enabled; end

  sig { void }
  def clear_image_definition_id; end

  sig { void }
  def clear_version; end

  sig { returns(T::Boolean) }
  def enabled; end

  sig { params(value: T::Boolean).void }
  def enabled=(value); end

  sig { returns(Integer) }
  def image_definition_id; end

  sig { params(value: Integer).void }
  def image_definition_id=(value); end

  sig { returns(String) }
  def version; end

  sig { params(value: String).void }
  def version=(value); end
end
