# frozen_string_literal: true

require 'resilient'

module Failbot
  class HTTPBackend
    attr_reader :circuit_breaker
    attr_accessor :connect_timeout, :rw_timeout

    def initialize(url, connect_timeout = nil, timeout_seconds = nil, circuit_breaker_properties = {})
      raise ArgumentError, 'FAILBOT_HAYSTACK_URL setting required' if url.to_s.empty?

      @url = url
      @connect_timeout = connect_timeout
      @rw_timeout = timeout_seconds - @connect_timeout.to_f if timeout_seconds
      circuit_breaker_instrumenter = Failbot.instrumenter || Resilient::Instrumenters::Noop
      @circuit_breaker = Resilient::CircuitBreaker.get('failbot', circuit_breaker_properties.merge(instrumenter: circuit_breaker_instrumenter))
    end

    def report(data)
      send_data(data)
    end

    def reports
      []
    end

    def user
      @url.user || 'failbot'
    end

    def password
      @url.password
    end

    def ping
      request = Net::HTTP::Head.new('/')
      with_circuit_breaker do
        response = send_request(request)
        unless response.code == '200'
          raise StandardError,
                "couldn't ping Failbotg: #{response.code} #{response.message}"
        end
      end
    end

    private

    def generate_request_body(data)
      { 'json' => data.to_json }
    end

    def send_data(data)
      request = Net::HTTP::Post.new(@url.path)
      payload = generate_request_body(data)
      request.set_form_data(payload)

      with_circuit_breaker do
        response = send_request(request)
        unless response.code == '201'
          raise StandardError,
                "couldn't send exception to Failbotg: #{response.code} #{response.message}"
        end
      end
    rescue Failbot::CircuitBreakerOpenError
      raise StandardError, "won't send request to Failbotg (circuit breaker open): #{request.method} #{request.path}"
    end

    def send_request(request)
      request.basic_auth(user, password) if user && password

      # make request
      http = Net::HTTP.new(@url.host, @url.port)

      # use SSL if applicable
      http.use_ssl = true if @url.scheme == 'https'

      # Set the connect timeout if it was provided
      http.open_timeout = @connect_timeout if @connect_timeout
      http.read_timeout = @rw_timeout if @rw_timeout
      http.write_timeout = @rw_timeout if @rw_timeout

      # push it through
      http.request(request)
    rescue Failbot::CircuitBreakerOpenError
      raise StandardError, "won't send request to Failbotg (circuit breaker open): #{request.method} #{request.path}"
    ensure
      if defined?(http) && http.started?
        http.finish
      end
    end

    # Using yield for performance reasons: I'd rather pass an explicit block so
    # that's clear what the method does, but that's 1.5 times slower than using yield
    def with_circuit_breaker
      raise Failbot::CircuitBreakerOpenError unless circuit_breaker.allow_request?

      begin
        yield
        circuit_breaker.success
      rescue StandardError => e
        circuit_breaker.failure
        raise e
      end
    end
  end
end
