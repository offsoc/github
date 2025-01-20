# frozen_string_literal: true

require "active_support/time" # needed for use in Gem

module Meuse
  class RequestHmac
    DEFAULT_HMAC_ALGORITHM = "sha256"
    DEFAULT_HMAC_KEYS = ENV.fetch("REQUEST_HMAC_KEY", nil)
    REQUEST_HMAC_INTERVAL = 10.minutes

    attr_reader :keys, :algorithm

    class InvalidRequestHMAC < StandardError; end

    class MissingRequestHMACKeys < StandardError; end

    def initialize(keys: DEFAULT_HMAC_KEYS, algorithm: DEFAULT_HMAC_ALGORITHM)
      @keys = keys.to_s.split
      @algorithm = algorithm
    end

    def verify_request_hmac(received_hmac)
      if @keys.empty?
        raise MissingRequestHMACKeys, "No Request-HMAC keys are set"
      end

      if received_hmac.blank?
        raise InvalidRequestHMAC, "Request-HMAC header not present"
      end

      timestamp, hmac = received_hmac.split(".", 2)

      if timestamp.blank? || hmac.blank?
        raise InvalidRequestHMAC, "Request-HMAC header missing either timestamp or hmac value"
      end

      # We only need the integer value going forward.
      timestamp = timestamp.to_i

      # Allow for a bit of clock skew, latency, etc in either direction.
      valid_timestamp =
        timestamp > REQUEST_HMAC_INTERVAL.ago.to_i &&
        timestamp < REQUEST_HMAC_INTERVAL.from_now.to_i

      unless valid_timestamp
        raise InvalidRequestHMAC, "Timestamp is outside the allowed range"
      end

      match = @keys.any? do |request_hmac_key|
        ActiveSupport::SecurityUtils.secure_compare(
          received_hmac,
          request_hmac(Time.zone.at(timestamp), request_hmac_key),
        )
      end

      raise InvalidRequestHMAC, "Received HMAC is incorrect" unless match

      :success
    end

    def request_hmac(time, key = @keys.first)
      timestamp = time.to_i.to_s
      hmac = OpenSSL::HMAC.hexdigest(@algorithm, key, timestamp)
      "#{timestamp}.#{hmac}"
    end
  end
end
