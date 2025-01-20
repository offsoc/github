require "logger"

module Aqueduct
  module TestHelpers
    # A twirp test server implementation that clients can use to test aqueduct
    # integration.
    #
    #     TestServer.run(port: 5000) do |handler|
    #       client = Aqueduct::Client.new(
    #         app: "test-app",
    #         url: "http://127.0.0.1:5000/twirp"
    #       )
    #
    #       client.send_job(queue: "test-queue", payload: "abc")
    #       assert_equal 1, handler.enqueued_for(app: "test-app", queue: "test-queue").size
    #
    #       response = client.receive_job(queues: ["test-queue"])
    #       assert_equal "test-app", response[:app]
    #       # ...
    #
    #       handler.set_send_error(Twirp::Error.internal("OH NO"))
    #       assert_raise { client.send_job(queue: "test-queue", payload: "abc") }
    #
    #       handler.set_receive_error(Twirp::Error.internal("OH NO"))
    #       assert_raise { client.receive_job(queues: ["test-queue"]) }
    #     end
    class TestServer
      def self.run(handler: Handler.new, port:, timeout: 3, logger: default_logger)
        # Avoid requiring rack and webrick as real runtime dependencies.
        begin
          require "rack"
          require "webrick"
        rescue LoadError
          raise LoadError.new("The 'rack' and 'webrick' gems are required to run the test server")
        end

        service = Aqueduct::Api::V1::JobQueueServiceService.new(handler)

        service.before do |rack_env, env|
          handler.requests << rack_env
        end

        def service.call_handler(env)
          env[:ruby_method] = "handle_#{env[:ruby_method]}"
          super(env)
        end

        path_prefix = "/twirp/" + service.full_name

        begin
          server = WEBrick::HTTPServer.new(
            Logger: logger,
            Host: "127.0.0.1",
            Port: port
          )
          server.mount path_prefix, Rack::Handler::WEBrick, service

          background = Thread.new { server.start }
          background.abort_on_exception

          Timeout.timeout(timeout) do
            yield handler
          end
        ensure
          server&.stop
          background&.join
        end
      end

      def self.default_logger
        logger = Logger.new(STDOUT)
        logger.level = Logger::WARN
        logger
      end

      class Handler
        attr_reader :queues, :acks, :requests
        attr_accessor :send_delay, :receive_delay

        def initialize(backend_name: "")
          @backend_name = backend_name
          @id_counter = 0
          @queues = Hash.new { |apps, app|
            apps[app] = Hash.new { |queues, queue| queues[queue] = [] }
          }
          @receives = Hash.new { |receives, app| receives[app] = [] }
          @heartbeats = Hash.new { |heartbeats, app|
            heartbeats[app] = Hash.new { |queues, queue| queues[queue] = [] }
          }
          @acks = Hash.new { |acks, app|
            acks[app] = Hash.new { |queues, queue| queues[queue] = [] }
          }
          @in_progress = Hash.new { |jobs, app|
            jobs[app] = Hash.new { |queues, queue| queues[queue] = [] }
          }
          @requests = []
        end

        def enqueued_for(app:, queue:)
          @queues[app][queue]
        end

        def set_send_error(error)
          @send_error = error.is_a?(Proc) ? error : Proc.new { error }
        end

        def handle_send(request, headers)
          if @send_error && (send_error = @send_error.call)
            return send_error
          end

          sleep send_delay.to_i

          @queues[request.app][request.queue].push(request.to_h.merge(
            job_id: @id_counter += 1,
            backend_name: @backend_name
          ))

          {}
        end

        def set_receive_error(error)
          @receive_error = error
        end

        def handle_receive(request, headers)
          return @receive_error if @receive_error

          sleep receive_delay.to_i

          @receives[request.app].push(request.to_h)

          popped = nil
          request.queues.shuffle.each { |queue|
            break if popped = @queues[request.app][queue].pop
          }
          popped ||= {}

          # Help ensure default client id is re-used
          worker = request.worker
          if !worker.nil? && !worker.tags.nil? && worker.tags.to_h.has_key?("worker-id-in-headers")
            popped[:headers]["worker_id"] = request.worker.id
          end

          {
            app: request.app,
            queue: popped[:queue].to_s,
            job_id: popped[:job_id].to_s,
            payload: popped[:payload].to_s,
            headers: popped[:headers],
            backend_name: @backend_name,
          }
        end

        def receives_for(app:)
          @receives[app]
        end

        def handle_heartbeat(request, headers)
          if @heartbeat_error && (heartbeat_error = @heartbeat_error.call)
            return ack_error
          end

          @heartbeats[request.app][request.queue].push(request.to_h)
          {backend_name: @backend_name}
        end

        def heartbeats_for(app:, queue:)
          @heartbeats[app][queue]
        end

        def set_ack_error(error)
          @ack_error = error.is_a?(Proc) ? error : Proc.new { error }
        end

        def handle_ack(request, headers)
          if @ack_error && (ack_error = @ack_error.call)
            return ack_error
          end

          @acks[request.app][request.queue].push(request.to_h)
          {backend_name: @backend_name}
        end

        def acks_for(app:, queue:)
          @acks[app][queue]
        end

        def handle_peek(request, headers)
          {
            payloads: @queues[request.app][request.queue].map { |job| job[:payload] }
          }
        end

        def add_in_progress_job(app:, queue:, job_id:, payload:, client_id:, delivered_at:)
          @in_progress[app][queue] << {
            app: app,
            queue: queue,
            job_id: job_id,
            payload: payload,
            client_id: client_id,
            delivered_at: delivered_at,
          }
        end

        def handle_in_progress_jobs(request, headers)
          {
            in_progress: @in_progress[request.app][request.queue]
          }
        end

        def handle_list_queues(request, headers)
          queues = @queues.flat_map { |app, qs| qs.keys.map { |q| { app: app, name: q } } }
          # encode this behavior even though it's not currently exercised
          queues = queues.select { |q| q[:app] == request.app } unless request.app.empty?
          {
            queues: queues
          }
        end

        def handle_queue_depth(request, headers)
          {
            app: request.app,
            queue: request.queue,
            depth: @queues[request.app][request.queue].size,
          }
        end

        def handle_backend_ids(request, headers)
          response = {
            backend_ids: {},
            backend_names: {}
          }
          request.clients.each do |client|
            response[:backend_ids][client.client_id] = Google::Protobuf::StringValue.new({:value => "any"})
            response[:backend_names][client.client_id] = Google::Protobuf::StringValue.new({:value => "backend"})
          end
          request.workers.each do |worker|
            response[:backend_ids][worker.id] = Google::Protobuf::StringValue.new({:value => "any"})
            response[:backend_names][worker.id] = Google::Protobuf::StringValue.new({:value => "backend"})
          end
          response
        end

        def handle_send_batch(request, headers)
          if @send_error && (send_error = @send_error.call)
            return send_error
          end
          sleep send_delay.to_i
          request.send_requests.each do |req|
            @queues[req.app][req.queue].push(req.to_h.merge(
              job_id: @id_counter += 1,
              backend_name: @backend_name
            ))
          end

          index = 0
          responses = []
          @queues.keys.each do |app|
            @queues[app].keys.each do |queue|
              @queues[app][queue].each do |job|
                responses.push({ index: index, job_id: job[:job_id].to_s, error: nil })
                index += 1
              end
            end
          end
          { batch_message_responses: responses, backend_name: @backend_name }
        end
      end
    end
  end
end
