# frozen_string_literal: true

require "meuse/services/v1/metered_usage_twirp"
require "meuse/request_hmac"
require "meuse/twirp/hmac/request_signing_middleware"
require "meuse-client/version"

module Meuse
  class Client
    extend Forwardable

    def_delegators :metered_usage_client,
      :get_usage_line_items,
      :get_usage_breakdown,
      :get_entitlement_plans,
      :calculate_usage_quotes,
      :list_account_usage,
      :list_product_usage,
      :update_submission_details

    attr_reader :url

    def initialize(secret_key:, host: nil, path_prefix: "twirp", &blk)
      @host        = host || default_host_mapping[inferred_env] || default_host_mapping[:development]
      @url         = [@host.chomp("/"), *path_prefix.split("/").compact_blank].join("/")
      @path_prefix = path_prefix
      @secret_key  = secret_key
      @connection  = setup_default_connection(&blk)

      @metered_usage_client = setup_metered_usage_client
    end

    def connection=(conn, &blk)
      @connection = configure_connection(conn, &blk)
      @metered_usage_client = setup_metered_usage_client
    end

    private

    attr_reader :connection, :host, :metered_usage_client, :path_prefix, :secret_key

    def setup_default_connection(&blk)
      Faraday.new(url: url) do |conn|
        configure_connection(conn, &blk)

        conn.adapter Faraday.default_adapter
      end
    end

    def configure_connection(conn, &blk)
      conn.headers = conn.headers.merge(default_headers)
      conn.use Meuse::Twirp::HMAC::RequestSigningMiddleware, hmac_signing_service
      conn.options.timeout ||= 15
      yield(conn) if blk
      conn
    end

    def setup_metered_usage_client
      Meuse::Services::V1::MeteredUsageClient.new(connection)
    end

    def inferred_env
      if ENV["HEAVEN_DEPLOYED_ENV"].present?
        return :production if ENV["HEAVEN_DEPLOYED_ENV"].match?(/\A(?:production|prod|review-lab)\b/)
        return :staging if ENV["HEAVEN_DEPLOYED_ENV"].match?(/\Astaging\b/)
      end
      env = ENV.fetch("RAILS_ENV") { ENV.fetch("RACK_ENV", "development") }
      env.to_sym
    end

    def default_host_mapping
      @default_host_mapping ||= {
        development: "http://localhost:42421", # codespaces isn't using nginx, so `meuse.github.localhost` won't work
        staging: "https://meuse-staging.service.iad.github.net",
        production: "https://meuse-production.service.iad.github.net",
      }
    end

    def default_headers
      @default_headers ||= { "User-Agent" => "MeuseClient v#{Meuse::Client::VERSION}" }
    end

    def hmac_signing_service
      @hmac_signing_service ||= Meuse::RequestHmac.new(keys: secret_key)
    end
  end
end
