# frozen_string_literal: true

module GitHub
  module Telemetry
    module SemConv
      # Provides helpers for formatting HTTP headers for libraries like Faraday that use standard http header names.
      #
      # @example Recording HTTP Request Headers
      #   logger.debug("Request Headers", GitHub::SemanticConventions::HTTP.request_headers(request.headers, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   span.add_event("Request Headers", GitHub::SemanticConventions::HTTP.request_headers(request.headers, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   span.add_attributes(GitHub::SemanticConventions::HTTP.request_headers(request.headers, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   stats.distribution("browser.request.latency", span.duration, tags: GitHub::SemanticConventions::HTTP.request_headers(request.headers, "User-Agent")

      # @example Recording HTTP Response Headers
      #   logger.debug("Response Headers", GitHub::SemanticConventions::HTTP.response_headers(response.headers, "Content-Length", "User-Agent")
      #   span.add_event("Response Headers", GitHub::SemanticConventions::HTTP.response_headers(response.headers, "Content-Length", "User-Agent"))
      #   span.add_attributes(GitHub::SemanticConventions::HTTP.response_headers(response.headers, "Content-Length", "User-Agent"))
      #   stats.distribution("browser.request.latency", span.duration, tags: GitHub::SemanticConventions::HTTP.response_headers(response.headers, "User-Agent")
      #
      # See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md#http-request-and-response-headers
      # See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
      # See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
      module HTTP
        REQUEST_HEADER_PREFIX = "http.request.header."
        RESPONSE_HEADER_PREFIX = "http.response.header."

        RESERVERED_REQUEST_SEMANTIC_CONVENTIONS = {
          "Content-Length" => OpenTelemetry::SemanticConventions::Trace::HTTP_REQUEST_CONTENT_LENGTH,
          "Host" => OpenTelemetry::SemanticConventions::Trace::NET_HOST_NAME,
          "User-Agent" => OpenTelemetry::SemanticConventions::Trace::HTTP_USER_AGENT,
        }.freeze

        RESERVERED_RESPONSE_SEMANTIC_CONVENTIONS = {
          "Content-Length" => OpenTelemetry::SemanticConventions::Trace::HTTP_RESPONSE_CONTENT_LENGTH,
        }.freeze

        module_function

        # Formats Request Headers to OTel Semantic conventions for telemetry attributes
        #
        # @param request_headers [Hash<String, String>] Request Headers
        # @param header_keys [Array<String>]  Headers to extract and format to OTel Semantic conventions
        def request_headers(request_headers, *header_keys)
          header_keys.each_with_object({}) do |header, headers|
            value = request_headers[header]
            next if value.nil?

            headers[semconv_request_header(header)] = value
          end
        end

        # Formats Response Headers to OTel Semantic conventions for telemetry attributes
        #
        # @param response_headers [Hash<String, String>] Response Headers
        # @param header_keys [Array<String>]  Headers to extract and format to OTel Semantic conventions
        def response_headers(response_headers, *header_keys)
          header_keys.each_with_object({}) do |header, headers|
            value = response_headers[header]
            next if value.nil?

            headers[semconv_response_header(header)] = value
          end
        end

        # @api private
        def semconv_request_header(header)
          RESERVERED_REQUEST_SEMANTIC_CONVENTIONS.fetch(header) { "#{REQUEST_HEADER_PREFIX}#{header.downcase.gsub(/[-\s]/, '_')}" }
        end

        # @api private
        def semconv_response_header(header)
          RESERVERED_RESPONSE_SEMANTIC_CONVENTIONS.fetch(header) { "#{RESPONSE_HEADER_PREFIX}#{header.downcase.gsub(/[-\s]/, '_')}" }
        end
      end
    end
  end
end
