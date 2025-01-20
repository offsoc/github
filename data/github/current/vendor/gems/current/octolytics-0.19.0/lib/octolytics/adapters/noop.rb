require "octolytics/http_response"

module Octolytics
  module Adapters
    class Noop
      def get(url, params = {}, headers = {}, request_options = {})
        HttpResponse.new(200, {}, "")
      end

      def post(url, body = "", headers = {})
        HttpResponse.new(200, {}, "")
      end

      def put(url, body = "", headers = {})
        HttpResponse.new(200, {}, "")
      end
    end
  end
end
