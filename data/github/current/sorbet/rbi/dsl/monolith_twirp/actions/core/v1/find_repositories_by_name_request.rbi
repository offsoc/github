# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::FindRepositoriesByNameRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::FindRepositoriesByNameRequest`.

class MonolithTwirp::Actions::Core::V1::FindRepositoriesByNameRequest
  sig { params(nwos: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))).void }
  def initialize(nwos: T.unsafe(nil)); end

  sig { void }
  def clear_nwos; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def nwos; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def nwos=(value); end
end
