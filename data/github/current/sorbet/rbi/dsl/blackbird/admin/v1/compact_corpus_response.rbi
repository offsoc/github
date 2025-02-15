# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Admin::V1::CompactCorpusResponse`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Admin::V1::CompactCorpusResponse`.

class Blackbird::Admin::V1::CompactCorpusResponse
  sig { params(epoch_id: T.nilable(Integer), serving_offset: T.nilable(Integer)).void }
  def initialize(epoch_id: nil, serving_offset: nil); end

  sig { void }
  def clear_epoch_id; end

  sig { void }
  def clear_serving_offset; end

  sig { returns(Integer) }
  def epoch_id; end

  sig { params(value: Integer).void }
  def epoch_id=(value); end

  sig { returns(Integer) }
  def serving_offset; end

  sig { params(value: Integer).void }
  def serving_offset=(value); end
end
