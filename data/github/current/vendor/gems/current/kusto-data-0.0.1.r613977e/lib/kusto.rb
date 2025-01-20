# typed: true
# frozen_string_literal: true

module Kusto
  class Error < StandardError
    extend T::Sig

    sig { returns(T::Hash[String, T.untyped]) }
    attr_reader :details

    sig { returns(T.nilable(Net::HTTPResponse)) }
    attr_reader :http_response

    sig { params(message: String, details: T.nilable(T::Hash[String, T.untyped]), http_response: T.nilable(Net::HTTPResponse)).void }
    def initialize(message, details = nil, http_response = nil)
      super(details.nil? ?
        message :
        message + " (Inspect `Kusto::Error#details` for more information)")

      @details = details || {}
      @http_response = http_response
    end
  end

  class BadRequestError < Error; end
  class UnauthorizedError < Error; end
  class ForbiddenError < Error; end
  class NotFoundError < Error; end
  class ConflictError < Error; end
  class TooManyRequestsError < Error; end
  class InternalServerError < Error; end
  class ServiceUnavailableError < Error; end
  class GatewayTimeoutError < Error; end
  class UnknownError < Error; end

  module Errors
    extend T::Sig

    ERROR_MAP = T.let({
      400 => Kusto::BadRequestError,
      401 => Kusto::UnauthorizedError,
      403 => Kusto::ForbiddenError,
      404 => Kusto::NotFoundError,
      409 => Kusto::ConflictError,
      429 => Kusto::TooManyRequestsError,
      500 => Kusto::InternalServerError,
      503 => Kusto::ServiceUnavailableError,
      504 => Kusto::GatewayTimeoutError
    }.freeze, T::Hash[Integer, T.class_of(Kusto::Error)])

    sig { params(message: String, http_response: Net::HTTPResponse).returns(Kusto::Error) }
    def self.create_error(message, http_response)
      response_body_hash = JSON.parse(http_response.body) if http_response["Content-Type"].include?("application/json")
      error_class = ERROR_MAP.fetch(http_response.code.to_i, Kusto::UnknownError)
      error_class.new(message,
        response_body_hash,
        http_response)
    end
  end
end
