# typed: true
# frozen_string_literal: true

require "kusto/data/dataset"
require "kusto/data/kql"

module Kusto
  module Data
    class Client
      extend T::Sig
      include KQL

      sig { params(cluster_url: String, auth: T.nilable(Auth::AuthBase)).void }
      def initialize(cluster_url, auth)
        raise ArgumentError, "cluster_url cannot be empty" if cluster_url.empty?

        @cluster_url = cluster_url
        @query_uri = URI.parse("#{@cluster_url}/v2/rest/query")
        @auth = auth
      end

      sig { params(database: String, query: String, parameters: T::Hash[String, T.untyped]).returns(Dataset) }
      def query(database, query, parameters = {})
        raise ArgumentError, "database cannot be empty" if database.empty?
        raise ArgumentError, "query cannot be empty" if query.empty?

        frame_hashes = query_raw database, query, parameters
        Dataset.new(frame_hashes)
      end

      private

      sig { params(database: String, query: String, parameters: T::Hash[String, T.untyped]).returns(T::Array[T::Hash[String, T.untyped]]) }
      def query_raw(database, query, parameters = {})
        headers = {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }

        body = {
          db: database,
          csl: declaration_for(parameters) + query,
          properties: {
            parameters: parameters_for(parameters)
          }
        }.to_json

        query_response = send_query_request(headers, body)

        # Retry sending the request with a refreshed token if the response is unauthorized.
        if query_response.code.to_i == 401
          query_response = send_query_request(headers, body, force_token_refresh: true)
        end

        raise Errors.create_error("An error occurred while querying Kusto.", query_response) if query_response.code.to_i != 200

        query_response_object = JSON.parse(query_response.body)

        # Handle the case where an error is returned after the HTTP status is written to response.
        if query_response_object.instance_of?(Hash) && query_response_object.key?("error")
          raise Kusto::UnknownError.new("An error occurred while querying Kusto.", query_response_object)
        end

        query_response_object
      end

      sig { params(headers: T::Hash[String, String], body: String, force_token_refresh: T::Boolean).returns(Net::HTTPResponse) }
      def send_query_request(headers, body, force_token_refresh: false)
        headers["Authorization"] = "Bearer #{@auth.access_token(@cluster_url, force_refresh: force_token_refresh)}" if @auth

        query_request = Net::HTTP::Post.new(@query_uri, headers)
        query_request.body = body

        Net::HTTP.start(@query_uri.hostname, @query_uri.port, use_ssl: @query_uri.scheme == "https") do |http|
          http.request(query_request)
        end
      end
    end
  end
end
