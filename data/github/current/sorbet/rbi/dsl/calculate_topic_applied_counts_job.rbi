# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `CalculateTopicAppliedCountsJob`.
# Please instead update this file by running `bin/tapioca dsl CalculateTopicAppliedCountsJob`.

class CalculateTopicAppliedCountsJob
  class << self
    sig do
      params(
        batch_size: T.untyped,
        duration: T.untyped,
        last_processed_topic_id: T.untyped,
        block: T.nilable(T.proc.params(job: CalculateTopicAppliedCountsJob).void)
      ).returns(T.any(CalculateTopicAppliedCountsJob, FalseClass))
    end
    def perform_later(batch_size: T.unsafe(nil), duration: T.unsafe(nil), last_processed_topic_id: T.unsafe(nil), &block); end

    sig { params(batch_size: T.untyped, duration: T.untyped, last_processed_topic_id: T.untyped).returns(T.untyped) }
    def perform_now(batch_size: T.unsafe(nil), duration: T.unsafe(nil), last_processed_topic_id: T.unsafe(nil)); end
  end
end
