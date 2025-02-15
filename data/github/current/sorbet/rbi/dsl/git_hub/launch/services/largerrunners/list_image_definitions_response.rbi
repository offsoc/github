# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Largerrunners::ListImageDefinitionsResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Largerrunners::ListImageDefinitionsResponse`.

class GitHub::Launch::Services::Largerrunners::ListImageDefinitionsResponse
  sig do
    params(
      image_definitions: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Largerrunners::ImageDefinition], T::Array[GitHub::Launch::Services::Largerrunners::ImageDefinition]))
    ).void
  end
  def initialize(image_definitions: T.unsafe(nil)); end

  sig { void }
  def clear_image_definitions; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Largerrunners::ImageDefinition]) }
  def image_definitions; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Launch::Services::Largerrunners::ImageDefinition]).void }
  def image_definitions=(value); end
end
