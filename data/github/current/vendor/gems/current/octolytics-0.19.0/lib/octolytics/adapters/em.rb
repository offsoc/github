require "json"
require "em-http"
require "octolytics/deferred_response"

module Octolytics
  module Adapters
    class EM
      # Internal: Perform a get request.
      #
      # url - The String url to request.
      # params - The Hash of query params (default: {})
      # headers - The Hash of headers (default: {})
      # request_options - The Hash of options for the request (default: {}).
      #                   Unused. Here just for consistency with other adapters.
      #
      # Returns an Octolytics::DeferredResponse instance.
      def get(url, params = {}, headers = {}, request_options = {})
        DeferredResponse.new(::EM::HttpRequest.new(url).get({
          query: params,
          head: headers,
        }))
      end

      # Internal: Perform a post request.
      #
      # url - The String url to request.
      # body - The String or Hash body (default: "")
      # headers - The Hash of headers (default: {})
      #
      # Returns an Octolytics::DeferredResponse instance.
      def post(url, body = "", headers = {})
        body = if body.respond_to?(:to_str)
          body
        else
          JSON.dump(body)
        end

        DeferredResponse.new(::EM::HttpRequest.new(url).post({
          body: body,
          head: headers,
        }))
      end

      # Internal: Perform a put request.
      #
      # url - The String url to request.
      # body - The String or Hash body (default: "")
      # headers - The Hash of headers (default: {})
      #
      # Returns an Octolytics::DeferredResponse instance.
      def put(url, body = "", headers = {})
        body = if body.respond_to?(:to_str)
          body
        else
          JSON.dump(body)
        end

        DeferredResponse.new(::EM::HttpRequest.new(url).put({
          body: body,
          head: headers,
        }))
      end
    end
  end
end
