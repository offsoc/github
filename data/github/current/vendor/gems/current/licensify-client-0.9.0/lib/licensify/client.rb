
# frozen_string_literal: true

require "licensify/services/v1/product_enablement_api_twirp"
require "licensify/services/v1/customer_license_api_twirp"
require "licensify/twirp/hmac/request_signing_middleware"
require "licensify/version"

module Licensify
  class Client
    extend Forwardable

    def_delegators :product_enablement_client,
      :get_product_enablements,
      :upsert_product_enablement

    def_delegators :customer_license_client,
      :get_customer_license,
      :get_customer_licenses,
      :get_licensee_global_ids,
      :get_licensee_ids,
      :sync_organization_memberships

    def initialize(host: nil, path_prefix: "twirp", hmac_key:, &blk)
      @host = host || default_host_mapping[inferred_env] || default_host_mapping[:development]
      @url = [@host.chomp("/"), *path_prefix.split("/").reject { |s| s.nil? || s == "" }].join("/")
      @hmac_key = hmac_key

      @connection = setup_default_connection(&blk)
      @product_enablement_client = setup_product_enablement_client
      @customer_license_client = setup_customer_license_client
    end

    def connection=(conn, &blk)
      @connection = configure_connection(conn, &blk)
      @product_enablement_client = setup_product_enablement_client
      @customer_license_client = setup_customer_license_client
    end

    private

    attr_reader :connection, :url, :product_enablement_client, :customer_license_client

    def inferred_env
      if !ENV["HEAVEN_DEPLOYED_ENV"].nil?
        return :production if ENV["HEAVEN_DEPLOYED_ENV"].match?(/\A(?:production|prod|review-lab)\b/)
        return ENV["HEAVEN_DEPLOYED_ENV"]
      end
      env = ENV.fetch("RAILS_ENV") { ENV.fetch("RACK_ENV", "development") }
      env.to_sym
    end

    def default_host_mapping
      @default_host_mapping ||= {
        development: "http://localhost:12345",
        production: "https://licensify-production.service.iad.github.net",
        "staff-wus2-01": "http://licensify.licensify-staff-wus2-01.svc.cluster.local:12345",
        "prod-weu-01": "http://licensify.licensify-prod-weu-01.svc.cluster.local:12345",
      }
    end

    def setup_default_connection(&blk)
      Faraday.new(url:) do |conn|
        configure_connection(conn, &blk)

        conn.adapter Faraday.default_adapter
      end
    end

    def configure_connection(conn, &blk)
      conn.headers = conn.headers.merge(default_headers)
      conn.use Licensify::Twirp::HMAC::RequestSigningMiddleware, @hmac_key
      yield(conn) if blk
      conn
    end

    def default_headers
      @default_headers ||= { "User-Agent" => "LicensifyClient v#{Licensify::VERSION}" }
    end

    def setup_product_enablement_client
      Licensify::Services::V1::ProductEnablementServiceClient.new(connection)
    end

    def setup_customer_license_client
      Licensify::Services::V1::CustomerLicenseServiceClient.new(connection)
    end
  end
end
