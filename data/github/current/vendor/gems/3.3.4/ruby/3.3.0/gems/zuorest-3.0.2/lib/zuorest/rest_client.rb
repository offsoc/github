require "base64"
require "faraday"
require "faraday_middleware"
require "oauth2"
require "zuorest/api"

class Zuorest::RestClient
  extend Forwardable
  include Zuorest::Api

  DEFAULT_TIMEOUT = 60

  def_delegators :connection_options, :timeout, :timeout=, :open_timeout, :open_timeout=

  attr_accessor :debug, :logger, :name

  class NullLogger
    def info(*, **)
    end
  end

  def initialize(
    name: "zuorest",
    server_url:,
    access_key_id:,
    secret_access_key:,
    client_id:,
    client_secret:,
    apm_server_url: nil,
    apm_username: nil,
    apm_api_token: nil,
    timeout: DEFAULT_TIMEOUT,
    open_timeout: DEFAULT_TIMEOUT,
    logger: NullLogger.new
  )
    @server_url = server_url
    @access_key_id = access_key_id
    @secret_access_key = secret_access_key
    @apm_server_url = apm_server_url
    @apm_username = apm_username
    @apm_api_token = apm_api_token
    @default_headers = {
      "apiaccesskeyid" => access_key_id,
      "apisecretaccesskey" => secret_access_key,
      "Content-Type" => "application/json"
    }

    @name = name
    @logger = logger
    @debug = false

    @client_id = client_id
    @client_secret = client_secret
    @oauth2_client = OAuth2::Client.new(client_id, client_secret, site: server_url, auth_scheme: :request_body)
    oauth2_client.connection.options.timeout = timeout
    oauth2_client.connection.options.open_timeout = open_timeout

    self.oauth_token = nil

    @connection = Faraday.new(url: server_url, headers: default_headers) do |conn|
      conn.request :json
      conn.request :multipart
      conn.response :json, content_type: /\bjson$/

      yield conn if block_given?

      conn.options.open_timeout = open_timeout
      conn.options.timeout = timeout

      conn.adapter Faraday.default_adapter
    end
  end

  def post(path, body: nil, headers: nil)
    handle_response(
      connection.post(path, body, headers),
      method: :post,
      path:
    )
  end

  def get(path, params: nil, headers: nil)
    handle_response(
      connection.get(path, params, headers),
      method: :get,
      path:
    )
  end

  def put(path, body: nil, headers: nil)
    handle_response(
      connection.put(path, body, headers),
      method: :put,
      path:
    )
  end

  def delete(path, headers: nil)
    handle_response(
      connection.delete(path, nil, headers),
      method: :delete,
      path:
    )
  end

  def raw_get(path, headers = {})
    connection = Faraday.new(url: server_url, headers: default_headers) do |conn|
      conn.options.open_timeout = open_timeout
      conn.options.timeout = timeout

      yield conn if block_given?

      conn.adapter Faraday.default_adapter
    end

    connection.get do |req|
      req.url path

      headers.each do |key, value|
        req.headers[key] = value
      end
    end
  end

  # Internal: These readers are only used for testing and should not be used
  # outside of the gem code as the API may change
  attr_reader :client_id, :client_secret

  private

  attr_reader :connection, :server_url, :default_headers, :oauth2_client
  attr_accessor :oauth_token

  def oauth_header
    ensure_token_is_fresh

    { "Authorization" => "Bearer %s" % oauth_token.token }
  end

  # Private: Get a Zuora Advanced Payment Manager (APM) REST API URL
  #
  # Requires APM-specific client configuration.
  #
  # This is needed since APM uses a different hostname than the general Zuora REST API.
  # See https://www.zuora.com/developer/api-references/collections/overview/ for details.
  #
  # path - String URL path (e.g. "/api/v1/subscription_payment_runs")
  #
  # Returns a String
  def apm_url(path)
    URI::join(@apm_server_url, path).to_s
  end

  # Private: Get the authN header needed for Zuora Advanced Payment Manager (APM) API requests.
  #
  # Requires APM-specific client configuration.
  #
  # This is needed since APM uses a different authN scheme than the general Zuora REST API.
  # See https://www.zuora.com/developer/api-references/collections/overview/ for details.
  #
  # Returns a Hash
  def apm_auth_header
    value = Base64.strict_encode64("#{@apm_username}:#{@apm_api_token}")
    { "Authorization" => "Basic #{value}"}
  end

  def ensure_token_is_fresh
    if oauth_token.nil? || oauth_token.expired?
      self.oauth_token = oauth2_client.client_credentials.get_token
    end
  end

  def connection_options
    connection.options
  end

  # Response is a Faraday::Response
  def handle_response(response, method:, path:)
    unless response.success?
      if response.status == 429
        raise Zuorest::TooManyRequestsError.new(response.status, response.body, response.headers)
      elsif response.status == 504
        raise Zuorest::GatewayTimeoutError.new(response.status, response.body, response.headers)
      else
        raise Zuorest::HttpError.new(response.status, response.body, response.headers)
      end
    end

    if debug
      if response.body.nil? || response.body.empty?
        logger.info("blank response body", {
          "gh.billing.zuora.response.status" => response.status,
          "gh.billing.zuora.response.headers" => response.headers,
          "gh.billing.zuora.response.body" => response.body,
          "gh.billing.zuora.request.method" => method,
          "gh.billing.zuora.request.path" => path,
          "gh.zuorest.client.name" => name
        })
      end
    end

    response.body
  end
end
