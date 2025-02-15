# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::HostedComputeIms::AdminApi::GetCuratedImageDefinitionRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::HostedComputeIms::AdminApi::GetCuratedImageDefinitionRequest`.

class GitHub::HostedComputeIms::AdminApi::GetCuratedImageDefinitionRequest
  sig { params(image_definition_id: T.nilable(Integer)).void }
  def initialize(image_definition_id: nil); end

  sig { void }
  def clear_image_definition_id; end

  sig { returns(Integer) }
  def image_definition_id; end

  sig { params(value: Integer).void }
  def image_definition_id=(value); end
end
