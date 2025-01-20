# typed: true
# frozen_string_literal: true

require "kusto/data/client"
require "kusto/auth/app_auth"
require "kusto/auth/device_code_auth"

module Kusto
  module Data
    class ClientBuilder
      extend T::Sig

      AZURE_KUSTO_DOMAIN = "kusto.windows.net"

      sig { returns(String) }
      attr_reader :cluster_url

      sig { returns(T.nilable(Auth::AuthBase)) }
      attr_reader :auth

      sig { params(cluster_name: String).returns(ClientBuilder) }
      def use_azure_cluster(cluster_name)
        raise ArgumentError, "cluster_name cannot be empty" if cluster_name.empty?
        raise ArgumentError, "cluster_name is invalid" unless cluster_name.match?(/\A[a-z0-9-]+(\.[a-z0-9-]+)?\z/)
        raise RuntimeError, "cluster_url has already been set" unless @cluster_url.nil?

        @cluster_url = "https://#{cluster_name}.#{AZURE_KUSTO_DOMAIN}"
        self
      end

      sig { params(host: String, port: Integer, secure: T::Boolean).returns(ClientBuilder) }
      def use_local_cluster(host: "localhost", port: 8080, secure: false)
        raise ArgumentError, "host cannot be empty" if host.empty?
        raise ArgumentError, "port must be between 1 and 65535" unless (1..65_535).cover?(port)
        raise RuntimeError, "cluster_url has already been set" unless @cluster_url.nil?

        @cluster_url = "#{secure ? "https" : "http"}://#{host}:#{port}"
        self
      end

      sig { params(tenant_id: String, client_id: String, client_secret: String).returns(ClientBuilder) }
      def use_app_auth(tenant_id, client_id, client_secret)
        raise ArgumentError, "tenant_id cannot be empty" if tenant_id.empty?
        raise ArgumentError, "client_id cannot be empty" if client_id.empty?
        raise ArgumentError, "client_secret cannot be empty" if client_secret.empty?
        raise RuntimeError, "auth has already been set" unless @auth.nil?

        @auth = Auth::AppAuth.new(tenant_id, client_id, client_secret)
        self
      end

      sig { params(tenant_id: String, client_id: String, use_persistent_storage: T::Boolean).returns(ClientBuilder) }
      def use_device_code_auth(tenant_id, client_id, use_persistent_storage: false)
        raise ArgumentError, "tenant_id cannot be empty" if tenant_id.empty?
        raise ArgumentError, "client_id cannot be empty" if client_id.empty?
        raise RuntimeError, "auth has already been set" unless @auth.nil?

        @auth = Auth::DeviceCodeAuth.new(tenant_id, client_id, use_persistent_storage: use_persistent_storage)
        self
      end

      sig { returns(Client) }
      def build
        raise RuntimeError, "Cluster not specified. Make sure to call one of the 'use_*_cluster' methods." if @cluster_url.nil?
        raise RuntimeError, "Auth must be specified when using Azure clusters. Make sure to call one of the 'use_*_auth' methods." if @auth.nil? && @cluster_url.end_with?(AZURE_KUSTO_DOMAIN)

        Client.new(@cluster_url, @auth)
      end
    end
  end
end
