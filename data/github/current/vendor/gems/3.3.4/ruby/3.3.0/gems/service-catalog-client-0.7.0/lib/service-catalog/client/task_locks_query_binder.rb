# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("task_locks/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # TaskLocksQueryBinder contains methods for accessing task locks.
    class TaskLocksQueryBinder < QueryBinder

      # Acquire a task lock.
      #
      # @param name [String] The name, or key, of the task lock.
      # @param ttl [Integer] The number of seconds until the lock should be auto-released.
      #
      # @return [Response] The task lock. Access via +Response#data#task_lock+.
      def acquire(**kwargs)
        Response.new TaskLocks::AcquireTaskLockMutation.execute(client: client, **kwargs)
      end
    end
  end
end
