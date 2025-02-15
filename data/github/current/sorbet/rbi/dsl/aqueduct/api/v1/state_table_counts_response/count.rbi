# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::StateTableCountsResponse::Count`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::StateTableCountsResponse::Count`.

class Aqueduct::Api::V1::StateTableCountsResponse::Count
  sig { params(count: T.nilable(Integer), state: T.nilable(String)).void }
  def initialize(count: nil, state: nil); end

  sig { void }
  def clear_count; end

  sig { void }
  def clear_state; end

  sig { returns(Integer) }
  def count; end

  sig { params(value: Integer).void }
  def count=(value); end

  sig { returns(String) }
  def state; end

  sig { params(value: String).void }
  def state=(value); end
end
