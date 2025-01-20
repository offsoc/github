require 'json'

module Octolytics
  class Error < StandardError
    attr_reader :original_exception

    # Public: Initializes a new error
    #
    # options: Hash of options or String error message
    #          :original_exception - An Exception being wrapped (optional)
    def initialize(options = {})
      if String === options
        super(options)
      else
        super(options[:message])
        @original_exception = options[:original_exception]
      end
    end
  end

  module HttpError
    def self.from_response(code, headers, body)
      if klass = case code
                 when 404      then NotFoundError
                 when 409      then ConflictError
                 when 422      then UnprocessableEntityError
                 when 400..499 then HttpClientError
                 when 500..599 then HttpServerError
                 end
        klass.new(
          :code    => code,
          :message => error_message_from_http_response(code, headers, body)
        )
      end
    end

    def self.error_message_from_http_response(code, headers, body)
      message = if /json/i =~ headers["Content-Type"]
                  case data = JSON.load(body)
                  when Hash
                    data["error"]
                  else
                    data
                  end
                else
                  body
                end

      "HTTP %d - %s" % [code, message]
    end
    private_class_method :error_message_from_http_response

    attr_reader :code

    # Public: Initializes a new error resulting from a non-successful HTTP
    # response.
    #
    # options: Hash of options or String error message
    #          :code - HTTP status code (integer)
    def initialize(options = {})
      super(options)
      unless String === options
        @code = options[:code]
      end
    end
  end

  ServerError     = Class.new(Error)
  Timeout         = Class.new(ServerError)
  HttpServerError = Class.new(ServerError) { include HttpError }

  ClientError              = Class.new(Error)
  HttpClientError          = Class.new(ClientError) { include HttpError }
  NotFoundError            = Class.new(HttpClientError)
  ConflictError            = Class.new(HttpClientError)
  UnprocessableEntityError = Class.new(HttpClientError)
end
