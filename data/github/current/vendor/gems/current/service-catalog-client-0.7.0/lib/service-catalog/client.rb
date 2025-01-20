# frozen_string_literal: true

require "active_support/core_ext/string/inflections"
require "active_support/notifications"
require "net/http"
require "uri"

module ServiceCatalog
  # Client is the class for executing GraphQL requests against a Service Catalog API.
  class Client
    # Error is a generic error class when something goes wrong.
    class Error < StandardError; end

    # Seconds for the process to sleep between retries after encountering an error.
    DEFAULT_SLEEP_BETWEEN_RETRIES = 1

    # List of Ruby error classes to retry by default.
    # @return [Array] default list of exceptions to rescue
    DEFAULT_ERROR_CLASSES_TO_RETRY = [
      EOFError,
      SocketError,
      Net::OpenTimeout,              # Couldn't open a connection.
      Net::ReadTimeout,              # Timed out reading a response.
      Net::HTTPFatalError,           # The Error class for HTTP errors
      Net::HTTPRequestTimeOut,       # 408
      Net::HTTPInternalServerError,  # 500
      Net::HTTPBadGateway,           # 502
      Net::HTTPServiceUnavailable,   # 503
      Net::HTTPGatewayTimeOut,       # 504
    ].freeze

    # The full HTTPS URL to the Service Catalog GraphQL API.
    # @return [String] the full endpoint
    attr_reader :endpoint

    # The Authorization token for accessing the endpoint.
    # @return [String] the authorization token
    attr_reader :token

    # A URI class representation of the endpoint attribute.
    # @return [URI] the endpoint as a URI
    attr_reader :uri

    # A global sleep duration setting for all requests this client will execute.
    # @return [Float] the sleep duration in seconds
    attr_reader :sleep_duration

    # Additional options passed during creation of the Client.
    # @return [Hash] the options
    attr_reader :options

    # Create a new Client.
    #
    # @param endpoint [String] Full HTTP URL to the GraphQL API endpoint
    # @param token [String] Authorization token
    # @param options [Hash] Further options with symbol keys (+sleep_duration+ can be set this way)
    def initialize(endpoint:, token:, options: {})
      @endpoint = endpoint
      @token = token
      @uri = URI.parse(endpoint)
      @options = options
      @sleep_duration = options[:sleep_duration] || DEFAULT_SLEEP_BETWEEN_RETRIES
    end

    # Build HTTP headers for API call.
    #
    # @param context [Hash] (optional) list of additional headers to add
    #
    # @return [Hash] HTTP headers
    def headers(context = {})
      default_headers = {
        "User-Agent"    => "service-catalog-client/#{ServiceCatalog::Client::VERSION}",
        "Authorization" => "Bearer #{token}",
      }
      default_headers.merge!(context[:headers] || {}) if context
      default_headers
    end

    # Return the HTTP connection to the endpoint
    #
    # @return [Net::HTTP] HTTP client
    def connection
      Net::HTTP.new(uri.host, uri.port).tap do |client|
        client.use_ssl = uri.scheme == "https"
        client.open_timeout = options[:open_timeout] || 5
        client.read_timeout = options[:read_timeout] || 5
        client.write_timeout = options[:write_timeout] || 5
      end
    end

    # Execute GraphQL query against server.
    #
    # @param query [String] GraphQL query
    # @param variables [Hash] (optional) Variables for GraphQL query
    # @param context [Hash] (optional) Additional headers
    #
    # @return [Hash] GraphQL response, along with HTTP response as +"raw_response"+ key
    def query(query:, variables: {}, context: {})
      request = Net::HTTP::Post.new(uri.request_uri)

      request.basic_auth(uri.user, uri.password) if uri.user || uri.password

      request["Accept"] = "application/json"
      request["Content-Type"] = "application/json"
      headers(context).each { |name, value| request[name] = value }

      body = {}
      body["query"] = query.to_s
      body["variables"] = variables if variables.any?
      request.body = JSON.generate(body)

      response = nil
      ActiveSupport::Notifications.instrument("service_catalog_client.query", body) do
        response = connection.request(request)
      end
      response_data = case response
      when Net::HTTPOK, Net::HTTPBadRequest
        JSON.parse(response.body)
      else
        { "errors" => [{ "message" => "#{response.code} #{response.message}" }] }
      end

      response_data["raw_response"] = response

      response_data
    end

    # Run a query and retry on non-success responses.
    #
    # @param query [String] GraphQL query
    # @param variables [Hash] (optional) Variables for GraphQL query
    # @param context [Hash] (optional) Additional headers
    # @param max_retries [Integer] (optional) Maximum number of times to retry this query if it fails
    # @param retriable_error_classes [Array<Exception>] (optional) Acceptable error classes to retry from.
    #
    # @return (see #query)
    def query_with_retries(query:, variables: {}, context: {}, max_retries: 3, retriable_error_classes: DEFAULT_ERROR_CLASSES_TO_RETRY)
      retries_left ||= max_retries
      response_data = query(query: query, variables: variables, context: context)
      case response_data["raw_response"]
      when Net::HTTPOK, Net::HTTPBadRequest
        return response_data
      else
        raise response_data["raw_response"].error_type.new(
          "#{response_data["raw_response"].class} #{response_data["raw_response"].body}",
          response_data["raw_response"]
        )
      end
    rescue *retriable_error_classes
      raise unless retries_left > 0
      retries_left -= 1
      sleep sleep_duration
      retry
    end

    # Access the Groups-related API calls.
    #
    # @return [GroupsQueryBuilder]
    def groups
      @groups ||= GroupsQueryBinder.new(client: self)
    end

    # Access the Owners-related API calls.
    #
    # @return [OwnersQueryBuilder]
    def owners
      @owners ||= OwnersQueryBinder.new(client: self)
    end

    # Access the Scorecards-related API calls.
    #
    # @return [ScorecardsQueryBinder]
    def scorecards
      @scorecards ||= ScorecardsQueryBinder.new(client: self)
    end

    # Access the Services-related API calls.
    #
    # @return [ServicesQueryBinder]
    def services
      @services ||= ServicesQueryBinder.new(client: self)
    end

    # Access the SLO-related API calls.
    #
    # @return [SlosQueryBinder]
    def slos
      @slos ||= SlosQueryBinder.new(client: self)
    end

    # Access the Task Lock-related API calls.
    #
    # @return [TaskLocksQueryBinder]
    def task_locks
      @task_locks ||= TaskLocksQueryBinder.new(client: self)
    end

    # Access the User-related API calls.
    #
    # @return [UsersQueryBinder]
    def users
      @users ||= UsersQueryBinder.new(client: self)
    end
  end
end

Dir[File.expand_path("client/*.rb", __dir__)].each { |f| require f }
