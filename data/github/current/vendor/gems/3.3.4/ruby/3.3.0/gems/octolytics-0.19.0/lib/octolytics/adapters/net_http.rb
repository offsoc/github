require "uri"
require "json"
require "net/https"
require "octolytics/http_response"

module Octolytics
  module Adapters
    class NetHttp
      # https://gist.github.com/tenderlove/245188
      # http://tammersaleh.com/posts/rescuing-net-http-exceptions/
      ServerErrors = [
        ::EOFError,
        ::Errno::ECONNREFUSED,
        ::Errno::ECONNRESET,
        ::Errno::EHOSTUNREACH,
        ::Net::HTTPBadResponse,
        ::Net::HTTPHeaderSyntaxError,
        ::Net::ProtocolError,
        ::SocketError,
      ]

      TimeoutErrors = [
        ::Timeout::Error,
        ::Errno::ETIMEDOUT,
      ]

      # Url scheme used to determine if ssl should be on for http instance.
      HttpsScheme = "https".freeze

      # Public: Timeout (in seconds) for retrieving data
      attr_accessor :timeout

      # Public: Where should net http output be logged to, if anywhere.
      attr_accessor :logger

      def initialize(options = {})
        @timeout = options.fetch(:timeout) { 10 }
        @logger = options[:logger]
      end

      def get(url, params = {}, headers = {}, request_options = {})
        perform Net::HTTP::Get, url, headers, params: params, request_options: request_options
      end

      def post(url, body = "", headers = {})
        perform Net::HTTP::Post, url, headers, body: body
      end

      def put(url, body = "", headers = {})
        perform Net::HTTP::Put, url, headers, body: body
      end

      private

      def perform(http_method, url, headers = {}, options = {})
        request_options = options.delete(:request_options)
        uri = URI(url)
        http = build_http(uri)
        options = options.merge(headers: headers)
        request = build_request(http_method, uri, options)

        if request_options && request_options[:streaming_response]
          response = http.request(request) do |response|
            response.read_body do |chunk|
              request_options.fetch(:streaming_response_handler).call(chunk)
            end
          end
        else
          response = http.request(request)
        end

        HttpResponse.new response.code.to_i, response.to_hash, response.body
      rescue *TimeoutErrors => e
        raise Octolytics::Timeout, original_exception: e
      rescue *ServerErrors => e
        raise Octolytics::ServerError, original_exception: e
      end

      def build_http(uri)
        http = Net::HTTP.new(uri.host, uri.port)
        http.open_timeout = @timeout
        http.read_timeout = @timeout

        if uri.scheme == HttpsScheme
          http.use_ssl = true
          http.verify_mode = OpenSSL::SSL::VERIFY_PEER
        end

        if @logger
          http.set_debug_output(@logger)
        end

        http
      end

      def build_request(request_class, uri, options = {})
        uri = uri.dup

        if options[:params] && !options[:params].empty?
          uri.query = URI.encode_www_form(options[:params])
        end

        headers = options[:headers]

        if headers
          headers.each do |header, value|
            unless header.is_a?(String)
              raise ArgumentError, "header keys must be strings"
            end
          end
        end

        request = request_class.new(uri.request_uri)
        request.initialize_http_header(headers) if headers
        request.body = normalize_request_body(options[:body]) if options[:body]
        request.basic_auth uri.user, uri.password if uri.user || uri.password

        request
      end

      def normalize_request_body(body)
        if body.respond_to?(:to_str)
          body
        else
          JSON.dump(body)
        end
      end
    end
  end
end
