# frozen_string_literal: true

require_relative './errors'
require_relative './proto/timeline_pb'
require_relative './proto/timeline_twirp'

module Timeline
  class Client
    ALGORITHM = "sha256"
    HMAC_HEADER = "Request-HMAC"

    def initialize(conn, hmac_key)
      @client = ::Github::Timeline::TimelineServiceClient.new(conn)
      @hmac_key = hmac_key
    end

    def get(entity, viewer)
      request = ::Github::Timeline::GetTimelineRequest.new(entity: entity, viewer: viewer)
      @client.get(request, headers: request_headers)
    rescue Faraday::TimeoutError => e
      raise Timeline::Errors::ClientError, e.message
    end

    private

    def request_headers
      headers = {}
      headers[HMAC_HEADER] = request_hmac
      headers
    end

    def request_hmac
      return "" if @hmac_key.nil?

      hmac = OpenSSL::HMAC.hexdigest(ALGORITHM, @hmac_key, header_timestamp)
      "#{header_timestamp}.#{hmac}"
    end

    def header_timestamp
      Time.now.to_i.to_s
    end
  end
end
