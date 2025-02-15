# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authzd::Enumerator::ForSubjectResponse`.
# Please instead update this file by running `bin/tapioca dsl Authzd::Enumerator::ForSubjectResponse`.

class Authzd::Enumerator::ForSubjectResponse
  sig { params(result_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))).void }
  def initialize(result_ids: T.unsafe(nil)); end

  sig { void }
  def clear_result_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def result_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def result_ids=(value); end
end
