module Aqueduct
  module Worker
    class AqueductBackend
      def initialize(client:)
        @client = client
      end

      def register_worker(worker)
        # unsupported
      end

      def unregister_worker(worker, exception = nil)
        # unsupported
      end

      def workers
        # unsupported
      end

      def get_worker(id)
        # unsupported
      end

      def queues
        # unsupported
      end

      def destroy(id)
        # unsupported
      end

      def purge(queue)
        # unsupported
      end

      def pop(queues, timeout, tags: {}, worker_id:, worker_pool: nil)
        response = @client.receive_job(queues: queues, timeout: timeout, tags: tags, worker_id: worker_id, worker_pool: worker_pool)

        if response[:queue].empty?
          return Result.empty(backend_name: response[:backend_name], backoff_seconds: response[:backoff_seconds])
        end

        Result.ok(Job.new(
          id: response[:job_id],
          app: response[:app],
          queue: response[:queue],
          payload: response[:payload],
          headers: response[:headers],
          backend_name: response[:backend_name],
          sent_at: response[:sent_at],
        ), backend_name: response[:backend_name], backoff_seconds: response[:backoff_seconds])
      rescue Aqueduct::Client::PayloadValidationError => e
        Result.invalid_payload(Job.new(
          id: e.job[:job_id],
          app: e.job[:app],
          queue: e.job[:queue],
          payload: e.job[:payload],
          headers: e.job[:headers],
          backend_name: e.job[:backend_name],
          sent_at: e.job[:sent_at],
        ), backend_name: e.job[:backend_name])
      rescue Aqueduct::Client::ClientError => e
        Result.error(e)
      end

      def heartbeat(job)
        resp = @client.heartbeat_job(
          queue: job.queue,
          job_id: job.id,
        )
        Result.ok(resp, backend_name: resp[:backend_name])
      rescue Aqueduct::Client::ClientError => e
        Result.error(e)
      end

      def report_success(job)
        resp = @client.ack_job(
          queue: job.queue,
          job_id: job.id,
          success: true,
        )
        Result.ok(resp, backend_name: resp[:backend_name])
      rescue Aqueduct::Client::ClientError => e
        Result.error(e)
      end

      def report_failure(job, exception = nil)
        resp = @client.ack_job(
          queue: job.queue,
          job_id: job.id,
          success: false,
          )
        Result.ok(resp, backend_name: resp[:backend_name])
      rescue Aqueduct::Client::ClientError => e
        Result.error(e)
      end

      def url
        @client.url
      end

      def client_id
        @client.client_id
      end
    end
  end
end
