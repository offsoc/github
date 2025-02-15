# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Admin::V1::CompactCorpusRequest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Admin::V1::CompactCorpusRequest`.

class Blackbird::Admin::V1::CompactCorpusRequest
  sig do
    params(
      compaction_type: T.nilable(T.any(Symbol, Integer)),
      corpus: T.nilable(String),
      incremental_options: T.nilable(Blackbird::Admin::V1::IncrementalCompactionOptions)
    ).void
  end
  def initialize(compaction_type: nil, corpus: nil, incremental_options: nil); end

  sig { void }
  def clear_compaction_type; end

  sig { void }
  def clear_corpus; end

  sig { void }
  def clear_incremental_options; end

  sig { returns(T.any(Symbol, Integer)) }
  def compaction_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def compaction_type=(value); end

  sig { returns(String) }
  def corpus; end

  sig { params(value: String).void }
  def corpus=(value); end

  sig { returns(T.nilable(Blackbird::Admin::V1::IncrementalCompactionOptions)) }
  def incremental_options; end

  sig { params(value: T.nilable(Blackbird::Admin::V1::IncrementalCompactionOptions)).void }
  def incremental_options=(value); end
end
