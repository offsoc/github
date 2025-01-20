# frozen_string_literal: true

require "faraday"
require "json"
require_relative "../../../lib/twirp/api/v1/api_twirp"
require_relative "./hmac_middleware"

module S4
  module V1
    class Client
      class ResponseError < StandardError
        attr_accessor :code
        def initialize(twirpErr)
          @code = twirpErr.code
          super(twirpErr.msg)
        end
      end

      def initialize(host, faraday_options: {}, hmac_key: ENV["S4_HMAC_KEY"])
        @host = host
        @hmac_key = hmac_key
        @faraday_options = {
          open_timeout: 1,
          timeout: 10,
          params_encoder: Faraday::FlatParamsEncoder
        }.merge(faraday_options)
      end

      #
      # Query the S4 API metrics endpoint and returns all the metrics for the given Owner ID for the specified time period.
      #
      # @param [String] owner_id The Owner ID.
      # @param [Hash] opts The options for the query.
      # @option opts [String] :format The output format: "json" or "csv".
      # @option opts [Integer] :date_start The start date for the query in seconds since epoch.
      # @option opts [Integer] :date_end The end date for the query in seconds since epoch.
      #
      # @return [String] Query response in the requested format.
      #
      def metrics(owner_id, format: "json", date_start: nil, date_end: nil)
        req = S4::Api::V1::MetricsReq.new
        req.owner_id = owner_id
        req.accept = delivery_format(format)
        req.date_start = date_start unless date_start.nil?
        req.date_end = date_end ? date_end.to_i : Time.now.utc.to_i
        res = twirp_client.metrics(req)
        if res.error
          raise ResponseError.new(res.error)
        end
        decode_metrics(res)
      end

      #
      # Query the S4 API filtered metrics endpoint and returns the filtered metrics for the given Owner ID for the specified time period.
      #
      # @param [String] owner_id The Owner ID.
      # @param [Hash] opts The options for the query.
      # @option opts [String] :format The output format: "json" or "csv".
      # @option opts [Integer] :date_start The start date for the query in seconds since epoch.
      # @option opts [Integer] :date_end The end date for the query in seconds since epoch.
      #
      # @return [String] Query response in the requested format.
      #
      def filtered_metrics(owner_id, format: "json", date_start: nil, date_end: nil)
        req = S4::Api::V1::MetricsReq.new
        req.owner_id = owner_id
        req.accept = delivery_format(format)
        req.date_start = date_start unless date_start.nil?
        req.date_end = date_end ? date_end.to_i : Time.now.utc.to_i
        res = twirp_client.filtered_metrics(req)
        if res.error
          raise ResponseError.new(res.error)
        end
        decode_metrics(res)
      end

      #
      # Counts the number of metrics for a given Owner ID.
      #
      # @param [String] owner_id The Owner ID.
      # @param [Hash] opts The options for the query.
      # @option opts [Integer] :date_start The start date for the query in seconds since epoch.
      # @option opts [Integer] :date_end The end date for the query in seconds since epoch.
      #
      # @return [Integer] the number for documents found.
      #
      def count(owner_id, date_start: nil, date_end: nil)
        req = S4::Api::V1::CountReq.new
        req.owner_id = owner_id
        req.date_start = date_start unless date_start.nil?
        req.date_end = date_end ? date_end.to_i : Time.now.utc.to_i
        res = twirp_client.count_metrics(req)
        if res.error
          raise ResponseError.new(res.error)
        end
        res.data.count
      end

      private

      def twirp_client
        faraday = Faraday.new([@host, "twirp"].join("/")) do |conn|
          conn.options.merge! @faraday_options
          conn.use S4::V1::Client::HMACMiddleware, @hmac_key
          conn.request :retry
          conn.adapter(Faraday.default_adapter)
        end
        S4::Api::V1::S4Client.new(faraday)
      end

      def request_version
        :v1
      end

      def decode_metrics(res)
        return if res.nil?
        decoded = Zlib::GzipReader.new(StringIO.new(res.data.blob))
        return decoded.read
      end

      def delivery_format(format)
        case format.downcase
        when "json"
          S4::Api::V1::ContentType::JSON
        when "csv"
          S4::Api::V1::ContentType::CSV
        end
      end
    end
  end
end
