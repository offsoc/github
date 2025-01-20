module Aqueduct
  module Worker
    # Defines the backend interface
    class Backend
      def register_worker(worker)
        raise NotImplementedError
      end

      def unregister_worker(worker, exception = nil)
        raise NotImplementedError
      end

      def workers
        raise NotImplementedError
      end

      def get_worker(worker_id)
        raise NotImplementedError
      end

      def queues
        raise NotImplementedError
      end

      def destroy(job_id)
        raise NotImplementedError
      end

      def purge(queue)
        raise NotImplementedError
      end

      def pop(queues, timeout, worker_id:, worker_pool: nil)
        raise NotImplementedError
      end

      def heartbeat(job)
        raise NotImplementedError
      end

      def client_id
        raise NotImplementedError
      end

      def report_success(job)
        raise NotImplementedError
      end

      def report_failure(job, error)
        raise NotImplementedError
      end
    end
  end
end
