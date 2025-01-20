# frozen_string_literal: true

module GitHubTrilogyAdapter
  module DeadlockRetries
    def initialize(...)
      super
      @deadlock_retries = @config[:deadlock_retries] || 0
    end

    # Patch #transaction to retry the transaction if it errored because of a
    # deadlock. We may want to remove this patch and let the application
    # decide when to retry, but as of Sept. 2023 we are relying on it for a
    # small number of transactions (see Splunk
    # `index="prod-exceptions" event="deadlock_retry" transaction_open=true`)
    # See https://github.com/github/ruby-architecture/issues/445 for additional
    # context.
    def transaction(**options)
      retries = @deadlock_retries
      begin
        super
      rescue ActiveRecord::StatementInvalid => error
        raise error if in_nested_transaction?
        raise error if retries <= 0

        if deadlocked? error
          @instrumenter.instrument("sql_deadlock.active_record", error: error, transaction: true)
          backoff(@deadlock_retries - retries)
          retries -= 1
          retry
        end

        raise error
      end
    end

    private
      def in_nested_transaction?
        open_transactions != 0
      end

      def deadlocked?(exception)
        exception.is_a?(ActiveRecord::Deadlocked) || exception.is_a?(ActiveRecord::LockWaitTimeout)
      end

      # Patch #retryable_query_error? to instrument retryable deadlocks
      # https://github.com/rails/rails/blob/af95a7d89f3cf1c27042f98be0eb8c59794386ac/activerecord/lib/active_record/connection_adapters/abstract_adapter.rb#L1072-L1076
      def retryable_query_error?(exception)
        super.tap do |result|
          if result
            @instrumenter.instrument("sql_deadlock.active_record", error: exception)
          end
        end
      end
  end
end
