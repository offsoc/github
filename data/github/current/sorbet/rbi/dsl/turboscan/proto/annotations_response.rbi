# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::AnnotationsResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::AnnotationsResponse`.

class Turboscan::Proto::AnnotationsResponse
  sig do
    params(
      results: T.nilable(T.any(Google::Protobuf::RepeatedField[Turboscan::Proto::AnnotationResult], T::Array[Turboscan::Proto::AnnotationResult]))
    ).void
  end
  def initialize(results: T.unsafe(nil)); end

  sig { void }
  def clear_results; end

  sig { returns(Google::Protobuf::RepeatedField[Turboscan::Proto::AnnotationResult]) }
  def results; end

  sig { params(value: Google::Protobuf::RepeatedField[Turboscan::Proto::AnnotationResult]).void }
  def results=(value); end
end
