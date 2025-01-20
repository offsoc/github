require "aqueduct/api/v1/api_pb"
require "aqueduct/api/v1/api_twirp"
require "securerandom"
require "openssl"
require "nanoid"

module Aqueduct
  class Client
    DEFAULT_TIMEOUT = 10
    GITHUB_REQUEST_ID_HEADER = "X-GitHub-Request-Id".freeze
    GLB_VIA_HEADER = "X-GLB-Via".freeze
    USER_AGENT_HEADER = "User-Agent".freeze
    HMAC_HEADER = "_hmac"
    HMAC_ALGORITHM = "sha256"

    API_AUTH_HTTP_HEADER = "Authorization"
    API_AUTH_AS_HTTP_HEADER = "X-Auth-As"
    API_AUTH_SCHEME = "HMAC-256"
    API_TOKEN_EXPIRATION = 5 * 60 # 5 minutes

    def self.generate_producer_id
      "#{Socket.gethostname}:#{SecureRandom.hex(10)}"
    end

    # Public: Build a new aqueduct client.
    #
    # app             - The String name of the application sending to and receiving from
    #                   aqueduct (required).
    # url             - The String URL of the aqueduct service (required).
    # client_id       - A String that uniquely identifies the client.
    # site            - An optional string site for the client. Used in site pausing. Will default
    #                   to the site in production by reading KUBE_SITE or metadata
    # timeout         - An Integer HTTP timeout for aqueduct send and ack requests. Defaults to
    #                   10 seconds.
    # receive_timeout - An Integer HTTP timeout specifically for receive requests. This timeout
    #                   must be higher than the receive_job timeout. Defaults to 10 seconds.
    #
    # api_key         - An API key for authenticating with the aqueduct API.
    # api_key_version - The API key version.
    #
    # send_hmac_secret     - An optional secret key used sign payloads and set the "_hmac" header.
    # receive_hmac_secrets - Optional secrets used to verify signed payloads. Multiple secrets are
    #                        allowed to support rolling creds.
    #
    # block           - An optional block that accepts the faraday HTTP connection. Used for
    #                   configuring faraday options.
    def initialize(app: Aqueduct.app, url: Aqueduct.url, client_id: Aqueduct.client_id,
                   timeout: DEFAULT_TIMEOUT, receive_timeout: DEFAULT_TIMEOUT, idempotent_send: true,
                   send_retries: 1, heartbeat_retries: 2, ack_retries: 5, site: Aqueduct.site,
                   tags: Aqueduct.tags, auth_as: nil, api_key: nil, api_key_version: nil, send_hmac_secret: nil,
                   receive_hmac_secrets: [], &block)
      @app = app
      @url = url
      @client_id = client_id
      @site = site || Aqueduct.site
      @tags = tags.clone
      @tags["site"] = @site if @site

      client_connection = build_http_client(url, timeout, &block)
      @client = Aqueduct::Api::V1::JobQueueServiceClient.new(client_connection)

      @receive_timeout = receive_timeout
      receive_connection = build_http_client(url, receive_timeout, &block)
      @receive_client = Aqueduct::Api::V1::JobQueueServiceClient.new(receive_connection)

      @send_retries = send_retries
      @heartbeat_retries = heartbeat_retries
      @ack_retries = ack_retries

      @idempotent_send = idempotent_send
      @producer_sequence = 0

      @auth_as = auth_as.to_s
      @api_key          = api_key.to_s
      @api_key_version  = Integer(api_key_version) if api_key_version
      if !@api_key.empty? && !@api_key_version
        raise ArgumentError.new("Missing api_key_version")
      end
      if @api_key_version && @api_key.empty?
        raise ArgumentError.new("Missing api_key")
      end

      @send_hmac_secret = send_hmac_secret.to_s if send_hmac_secret
      @receive_hmac_secrets = Array(receive_hmac_secrets).map(&:to_s) if receive_hmac_secrets&.any?
    end

    def url
      @url
    end

    # Public: Send a job to aqueduct. Refer to aqueduct API definition for additional documentation
    # on args and usage.
    #
    # queue                   - The String queue name (required).
    # payload                 - The String payload, treated as raw bytes (required).
    # headers                 - A Hash<String, String> of job headers.
    # redelivery_timeout_secs - An optional Integer redelivery timeout.
    # max_redelivery_attempts - An optional Integer max redlivery attempts.
    # deliver_at              - An optional Time or Integer UNIX timestamp.
    # external_id             - An optional ID used to identify a job e.g. ActiveJob ID
    # ttl                     - An optional TTL in seconds
    def send_job(queue:, payload:, headers: nil, redelivery_timeout_secs: nil, max_redelivery_attempts: nil, deliver_at: nil, external_id: nil, ttl: nil)
      request = create_send_request(
        app: @app,
        queue: queue,
        headers: headers,
        payload: payload,
        redelivery_timeout_secs: redelivery_timeout_secs,
        max_redelivery_attempts: max_redelivery_attempts,
        deliver_at: deliver_at,
        external_id: external_id,
        ttl: ttl
      )

      resp = with_retries(retry_count: @send_retries, backoff: 0) do
        rpc(@client, :Send, request)
      end

      resp.data.to_h
    end

    # Public: Send a batch of jobs to aqueduct. Refer to aqueduct API definition for additional documentation on args
    # and usage.
    #
    # jobs       - An array of Hashes with the following keys:
    #  app                     - The String name of the application sending to and receiving from aqueduct.
    #  queue                   - The String queue name (required).
    #  payload                 - The String payload, treated as raw bytes (required).
    #  headers                 - A Hash<String, String> of job headers.
    #  redelivery_timeout_secs - An optional Integer redelivery timeout.
    #  max_redelivery_attempts - An optional Integer max redlivery attempts.
    #  deliver_at              - An optional Time or Integer UNIX timestamp.
    #  external_id             - An optional ID used to identify a job e.g. ActiveJob ID
    # ttl                      - An optional TTL in seconds
    def send_jobs(jobs)
      requests = []
      jobs.each do |job|
        publishing_app = job[:app] || @app
        request = create_send_request(
          app: publishing_app,
          queue: job[:queue],
          headers: job[:headers],
          payload: job[:payload],
          redelivery_timeout_secs: job[:redelivery_timeout_secs],
          max_redelivery_attempts: job[:max_redelivery_attempts],
          deliver_at: job[:deliver_at],
          external_id: job[:external_id],
          ttl: job[:ttl],
        )
        requests << request
      end

      resp = with_retries(retry_count: @send_retries, backoff: 0) do
        rpc(@client, :SendBatch, send_requests: requests)
      end

      resp.data.to_h
    end

    # Public: Receive a job from aqueduct. Refer to aqueduct API definition for additional
    # documentation on args and usage.
    #
    # queues      - The Array<String> list of queues (required).
    # timeout     - The Integer poll timeout in seconds (required).
    # tags        - additional tags to merge with worker tags per-request
    # worker_id   - A long-lived id unique to the worker (or caller) invoking the Receive method.
    #               This is important for popping jobs from all Aqueduct backends for graceful
    #               failover.
    # worker_pool - The worker pool name used to logically group a set of workers. Required to
    #               enable aqueduct execution time throttling.
    def receive_job(queues:, timeout:, tags: {}, bypass_pausing: false, worker_id: default_worker_id, worker_pool: nil)
      # Ensure that the receive timeout doesn't exceed the request timeout.
      if timeout >= @receive_timeout
        timeout = @receive_timeout - 1
      end

      resp = rpc(@receive_client, :Receive, {
        app: @app,
        queues: Array(queues),
        worker: Aqueduct::Api::V1::Worker.new(
          id: worker_id,
          tags: @tags.merge(tags),
          pool: worker_pool,
        ),
        timeout_ms: (timeout * 1000).to_i,
        client_id: @client_id,
        bypass_pausing: bypass_pausing,
      })

      unless valid_payload?(resp)
        raise PayloadValidationError.new(job: resp.data.to_h)
      end

      resp.data.to_h
    end

    # Public: Heartbeat a job. Refer to aqueduct API definition for additional documentation on
    # args and usage.
    #
    # queue  - The String job queue name (required).
    # job_id - The String job ID (required).
    def heartbeat_job(queue:, job_id:)
      resp = with_retries(retry_count: @heartbeat_retries, backoff: 1) do
        rpc(@client, :Heartbeat, {
          app: @app,
          queue: queue,
          job_id: job_id,
          client_id: @client_id,
        }, job_id: job_id)
      end

      resp.data.to_h
    end

    # Public: ACK a job. Refer to aqueduct API definition for additional documentation on args and
    # usage.
    #
    # queue   - The String job queue name (required).
    # job_id  - The String job ID (required).
    # success - A Boolean to incidate job success or failure, informational only (required).
    def ack_job(queue:, job_id:, success:)
      status = if success
        Aqueduct::Api::V1::AckRequest::Status::SUCCESS
      else
        Aqueduct::Api::V1::AckRequest::Status::FAILURE
      end

      resp = with_retries(retry_count: @ack_retries, backoff: 1) do
        rpc(@client, :Ack, {
          app: @app,
          queue: queue,
          job_id: job_id,
          status: status,
          client_id: @client_id,
        }, job_id: job_id)
      end

      resp.data.to_h
    end

    # Public: Peek at jobs in a queue. Refer to aqueduct API definition for additional documentation
    # on args and usage.
    #
    # queue   - The String job queue name (required).
    # job_id  - The String job ID (required).
    # success - A Boolean to incidate job success or failure, informational only (required).
    def peek_jobs(queue:, count:)
      resp = rpc(@client, :Peek, {
        app: @app,
        queue: queue,
        count: count,
      })

      resp.data.to_h
    end

    # Public: List in-progress jobs in a queue. Refer to aqueduct API definition for additional
    # documentation on args and usage.
    #
    # queue - The String optional job queue name.
    def in_progress_jobs(queue:)
      resp = rpc(@client, :InProgressJobs, {
        app: @app,
        queue: queue,
      })

      resp.data.to_h
    end

    # Public: List queues. Refer to aqueduct API definition for additional documentation on args and
    # usage.
    def list_queues
      rpc(@client, :ListQueues, app: @app).data.to_h
    end

    # Public: Query queue depth. Refer to aqueduct API definition for additional documentation on
    # args and usage.
    #
    # queue - The String optional job queue name.
    def queue_depth(queue:)
      resp = rpc(@client, :QueueDepth, {
        app: @app,
        queue: queue,
      })

      resp.data.to_h
    end

    # Public: Get backend name and shard assignments for worker utilization. Refer to aqueduct
    # API definition for additional documentation on args and usage.
    def backend_ids(clients:, workers:)
      resp = rpc(@client, :BackendIds, {
        clients: clients,
        workers: workers,
      })

      resp.data.to_h
    end

    # encode changes the encoding of payload to be BINARY
    def encode(payload)
      if !payload.frozen?
        payload.force_encoding(Encoding::BINARY)
      else
        payload.dup.force_encoding(Encoding::BINARY)
      end
    end

    def client_id
      @client_id
    end

    # The default worker id generated on the first receive call to this client if no worker_id
    # was specified by a caller. Useful for maintaining compatibility with one-off clients.
    def default_worker_id
      @default_worker_id ||= [@client_id, Nanoid.generate].join("-")
    end

    private

    attr_reader :auth_as, :api_key, :api_key_version

    def create_send_request(app:, queue:, payload:, headers: nil, redelivery_timeout_secs: nil, max_redelivery_attempts: nil, deliver_at: nil, external_id: nil, ttl: nil)
      if payload.nil?
        raise ArgumentError.new("Payload can't be blank")
      end

      send_options = build_idempotent_send_options

      if redelivery_timeout_secs
        send_options[:redelivery_timeout_secs] = {value: redelivery_timeout_secs}
      end

      if max_redelivery_attempts
        send_options[:max_redelivery_attempts] = {value: max_redelivery_attempts}
      end

      if ttl
        send_options[:ttl_seconds] = {value: ttl}
      end

      if deliver_at
        if deliver_at.to_i <= 0
          raise ArgumentError.new("Invalid deliver_at #{deliver_at.inspect}")
        end

        send_options[:deliver_at] = {seconds: deliver_at.to_i}
      end

      encoded = encode(payload)

      if sign_payload?
        headers ||= {}
        headers[HMAC_HEADER] = hmac_sign(encoded, secret: @send_hmac_secret)
      end

      {
        app: app,
        queue: queue,
        payload: encoded,
        headers: headers,
        client_id: @client_id,
        external_id: external_id,
      }.merge(send_options)
    end

    def with_retries(retry_count:, backoff:)
      retries = 0
      begin
        yield
      rescue ClientError => e
        if retries < retry_count
          retries += 1
          sleep backoff
          retry
        else
          raise e
        end
      end
    end

    def build_http_client(url, timeout)
      Faraday.new(url) do |conn|
        conn.options.timeout = timeout
        if block_given?
          # block must specify an adapter!
          yield conn
        else
          conn.adapter Faraday.default_adapter
        end
      end
    end

    def rpc(client, rpc, input, metadata = {})
      request_id = RequestIdGenerator.github_request_id
      metadata = {
        rpc: rpc,
        request_id: request_id,
      }.merge(metadata)


      headers = {
        GITHUB_REQUEST_ID_HEADER => request_id,
        GITHUB_REQUEST_ID_HEADER => request_id,
        GLB_VIA_HEADER => RequestIdGenerator.glb_via,
        USER_AGENT_HEADER => "aqueduct-client ruby #{RUBY_VERSION} #{Socket.gethostname}",
      }

      if auth_enabled?
        headers[API_AUTH_HTTP_HEADER] = auth_header
        unless auth_as.empty?
          headers[API_AUTH_AS_HTTP_HEADER] = auth_as
        end
      end

      resp = client.rpc(rpc, input, headers: headers)

      if resp.error
        raise RequestError.new(resp.error, metadata)
      end

      resp
    rescue Faraday::Error
      raise ClientError.new(metadata)
    end

    def build_idempotent_send_options
      return {} unless @idempotent_send

      @producer_sequence += 1

      {producer_id: producer_id, producer_sequence: @producer_sequence}
    end

    def producer_id
      @producer_id ||= self.class.generate_producer_id
    end

    def sign_payload?
      @send_hmac_secret
    end

    def hmac_sign(value, secret:)
      OpenSSL::HMAC.hexdigest(HMAC_ALGORITHM, secret, value)
    end

    def valid_payload?(resp)
      return true unless @receive_hmac_secrets&.any?
      return true if resp.data.job_id.empty?

      hmac = resp.data.headers[HMAC_HEADER]
      @receive_hmac_secrets.each do |secret|
        expected = OpenSSL::HMAC.hexdigest(HMAC_ALGORITHM, secret, resp.data.payload)
        return true if hmac == expected
      end

      return false
    end

    def auth_enabled?
      !api_key.empty?
    end

    def auth_header
      token_expiration = Time.now.to_i + API_TOKEN_EXPIRATION
      token = [token_expiration, api_key_version].join(":")
      signature = hmac_sign(token, secret: api_key)
      "#{API_AUTH_SCHEME} #{token}:#{signature}"
    end

    class ClientError < StandardError
      attr_reader :metadata

      def initialize(metadata = {})
        @metadata = metadata
      end
    end

    class RequestError < ClientError
      attr_reader :error, :metadata

      def initialize(error, metadata = {})
        @error = error
        @metadata = metadata
      end

      def to_s
        "code:#{error.code} msg:#{error.msg.inspect} meta:#{error.meta.inspect}"
      end
    end

    class PayloadValidationError < ClientError
      attr_reader :job

      def initialize(job:)
        @job = job
      end

      def to_s
        "Invalid HMAC #{hmac} for job_id=#{job_id} queue=#{queue}"
      end

      def hmac
        job.fetch(:headers, {})[HMAC_HEADER]
      end

      def job_id
        job[:job_id]
      end

      def queue
        job[:queue]
      end
    end

    class RequestIdGenerator
      def self.github_request_id
        SecureRandom.uuid
      end

      def self.glb_via
        "hostname=#{Socket.gethostname} t=#{Time.now.to_f}"
      end
    end
  end
end
