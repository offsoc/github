require "em/deferrable"
require "octolytics/response"
require "octolytics/http_response"

module Octolytics
  # Response from an EventMachine request, which may be realized in the future.
  class DeferredResponse
    include EM::Deferrable

    def initialize(request)
      request.callback {
        status = request.response_header.status
        headers = request.response_header
        body = request.response

        begin
          response = HttpResponse.new(status, headers, body)
          succeed response
        rescue Octolytics::Error => exception
          fail exception
        end
      }.errback {
        case request.error
        when Errno::ETIMEDOUT, /timeout/i
          fail Octolytics::Timeout.new(:original_exception => request.error)
        else
          fail Octolytics::Error.new(:original_exception => request.error)
        end
      }
    end
  end
end
