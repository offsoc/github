require "octolytics/response"
require "octolytics/response_errors"
require "json"

module Octolytics
  # Response object that is returned from all adapter requests.
  class HttpResponse < Response
    JsonRegex = /json/i
    ContentType = "content-type"

    attr_reader :status, :headers, :body

    # Public: Construct a new Response from an HTTP response
    #
    # status - HTTP status code (e.g., 200)
    # headers - Hash of HTTP headers
    # body - String of HTTP response body
    #
    # An Octolytics::Error exception is raised if the response is a client or
    # server error.
    def initialize(status, headers, body)
      headers = normalize_headers(headers)

      if error = HttpError.from_response(status, headers, body)
        raise error
      else
        @status = status
        @headers = headers
        @body = body
      end
    end

    # Public: The body converted from json to ruby.
    def data
      @data ||= if json?
        JSON.load(@body)
      else
        {}
      end
    end

    # If no error was raised by the constructor, this response was successful.
    def success?
      true
    end

    private

    # Private: Is the response body json?
    def json?
      @headers[ContentType] =~ JsonRegex
    end

    # {"Content-Type" => ["application/json"]} to {"content-type" => "application/json"}.
    def normalize_headers(headers)
      normalized = {}
      headers.each do |name, value|
        name = name.to_s.downcase.gsub("_", "-")
        value = value.is_a?(Array) ? value.first : value
        normalized[name] = value
      end
      normalized
    end
  end
end
