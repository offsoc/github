# typed: true
# frozen_string_literal: true

require "faraday"
require_relative "hydro/schemas/dotcom_codespaces/v0/script_usage_pb"

module DX
  module Events
    class HydroClient

      COLLECTOR_API_URL = "https://collector.githubapp.com"
      EVENTS_PATH = "/hydro/api/v1/events"
      HYDRO_APP = "dotcom-codespaces"
      LOG_FILE = "tmp/dx-events-hydro-client.log"

      def self.connection
        Faraday.new(COLLECTOR_API_URL) do |conn|
          conn.request :retry,
            max:                 2,
            interval:            0.05,
            interval_randomness: 0.5,
            backoff_factor:      2,
            exceptions:  [Faraday::ConnectionFailed, Faraday::RetriableResponse, Faraday::TimeoutError]

          conn.adapter Faraday.default_adapter
        end
      end

      def self.report_event(payload)
        unless secret = ENV.fetch("DOTCOM_CODESPACES_HYDRO_COLLECTOR_SECRET", nil)
          log("DOTCOM_CODESPACES_HYDRO_COLLECTOR_SECRET not set in codespace")
          return
        end

        hmac = OpenSSL::HMAC.hexdigest("sha256", secret, payload)

        response = connection.post do |req|
          req.url(EVENTS_PATH)
          req.headers["Content-Type"] = "application/json"
          req.headers["Authorization"] = "Hydro #{hmac}"
          req.headers["X-Hydro-App"] = HYDRO_APP
          req.body = payload
        end

        if response.success?
          log("Successfully reported hydro event: #{payload}")
        else
          log("Failed to report even, got #{response.status} response attempting to post to collector")
        end
      rescue => e
        # If something goes wrong, just return; we don't want to bubble up the
        # failure to users
        log("Failed to report event: #{e.message}")
      end

      def self.log(message)
        File.open(LOG_FILE, "a") do |f|
          f.puts "#{Time.now}\t#{message}"
        end
        nil
      end
    end
  end
end
