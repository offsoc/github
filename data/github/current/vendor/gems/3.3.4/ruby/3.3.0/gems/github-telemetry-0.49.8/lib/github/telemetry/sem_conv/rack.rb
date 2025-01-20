# frozen_string_literal: true

module GitHub
  module Telemetry
    module SemConv
      # Utility methods for formatting Rack HTTP Request and Response Headers to OTel Semantic conventions for telemetry attributes
      #
      # This module will attempt format values using `http.request.header.` and `http.response.header.` prefixes while also taking into consideration
      # headers that are already captured in special case attributes attributes such as `Content-Length`, `Host`, and `User-Agent`.
      #
      # Rack has an asymmetric interface for request and response headers and therefore must be handled differently and are separated into multiple functions.
      # The request header env has keys are structured in CGI-like variables while the response does not perform any special case formatting.
      # This module attempts to provide a symmetric interface by standardizing the key format to match the HTTP Specification
      #
      # @example Recording Rack HTTP Request Headers
      #   logger.debug("Request Headers", GitHub::SemanticConventions::Rack.request_headers(request.env, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   span.add_event("Request Headers", GitHub::SemanticConventions::Rack.request_headers(request.env, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   span.add_attributes(GitHub::SemanticConventions::Rack.request_headers(request.env, "Content-Length", "User-Agent", "X-GitHub-Request-Id"))
      #   stats.distribution("browser.request.latency", span.duration, tags: GitHub::SemanticConventions::Rack.request_headers(request.env, "User-Agent")

      # @example Recording a Rack HTTP Response Header
      #   logger.debug("Response Headers", GitHub::SemanticConventions::Rack.response_headers(response.headers, "Content-Length", "User-Agent")
      #   span.add_event("Response Headers", GitHub::SemanticConventions::Rack.response_headers(response.headers, "Content-Length", "User-Agent"))
      #   span.add_attributes(GitHub::SemanticConventions::Rack.response_headers(response.headers, "Content-Length", "User-Agent"))
      #   stats.distribution("browser.request.latency", span.duration, tags: GitHub::SemanticConventions::Rack.response_headers(response.headers, "User-Agent")
      #
      # See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md#http-request-and-response-headers
      # See https://api.rubyonrails.org/classes/ActionDispatch/Http/Headers.html
      # See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
      # See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
      module Rack
        REQUEST_HEADER_PREFIX = "http.request.header."
        RESPONSE_HEADER_PREFIX = "http.response.header."

        RESERVERED_REQUEST_SEMANTIC_CONVENTIONS = {
          "CONTENT_LENGTH" => OpenTelemetry::SemanticConventions::Trace::HTTP_REQUEST_CONTENT_LENGTH,
          "HOST" => OpenTelemetry::SemanticConventions::Trace::NET_HOST_NAME,
          "USER_AGENT" => OpenTelemetry::SemanticConventions::Trace::HTTP_USER_AGENT,
        }.freeze

        RESERVERED_RESPONSE_SEMANTIC_CONVENTIONS = {
          "Content-Length" => OpenTelemetry::SemanticConventions::Trace::HTTP_RESPONSE_CONTENT_LENGTH,
        }.freeze

        module_function

        # Formats Rack HTTP Request Headers to OTel Semantic conventions for telemetry attributes
        #
        # @param env [Hash] env Rack HTTP Request environment
        # @param header_keys [Array<String>]  Headers to extract and format to OTel Semantic conventions
        def request_headers(env, *header_keys)
          header_keys.each_with_object({}) do |header, headers|
            rack_header_base = header.to_s.upcase.gsub(/[-\s]/, "_")
            rack_header = "HTTP_#{rack_header_base}"
            value = env[rack_header]
            next if value.nil?

            headers[semconv_request_header(rack_header_base)] = value
          end
        end

        # @api private
        def semconv_request_header(rack_header)
          RESERVERED_REQUEST_SEMANTIC_CONVENTIONS.fetch(rack_header) { "#{REQUEST_HEADER_PREFIX}#{rack_header.downcase}" }
        end

        # Formats Rack HTTP Response Headers to OTel Semantic conventions for telemetry attributes
        #
        # @param response_headers [Hash] Rack HTTP Response headers
        # @param header_keys [Array<String>] Headers to extract and format to OTel Semantic conventions
        def response_headers(response_headers, *header_keys)
          header_keys.each_with_object({}) do |header, headers|
            value = response_headers[header]
            next if value.nil?

            headers[semconv_response_header(header)] = value
          end
        end

        # @api private
        def semconv_response_header(rack_header)
          RESERVERED_RESPONSE_SEMANTIC_CONVENTIONS.fetch(rack_header) { "#{RESPONSE_HEADER_PREFIX}#{rack_header.downcase.gsub(/[-\s]/, '_')}" }
        end
      end
    end
  end
end
