# typed: true
# frozen_string_literal: true

module Seeds
  module TransactionHelper
    def self.repeat_in_batches_with_transaction(batch_size:, times:, record:, batch_callback: nil)
      batches = (1..times).each_slice(batch_size).map { |batch| batch.size }
      batches.each do |batch_size|
        record.transaction do
          batch_size.times do
            yield
          end
          batch_callback&.call batch_size
        end
      end
    end
  end
end
