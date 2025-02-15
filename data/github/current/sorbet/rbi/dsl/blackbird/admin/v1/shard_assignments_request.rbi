# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Admin::V1::ShardAssignmentsRequest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Admin::V1::ShardAssignmentsRequest`.

class Blackbird::Admin::V1::ShardAssignmentsRequest
  sig { params(corpus: T.nilable(String), offset: T.nilable(Google::Protobuf::Int64Value)).void }
  def initialize(corpus: nil, offset: nil); end

  sig { void }
  def clear_corpus; end

  sig { void }
  def clear_offset; end

  sig { returns(String) }
  def corpus; end

  sig { params(value: String).void }
  def corpus=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def offset; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def offset=(value); end
end
