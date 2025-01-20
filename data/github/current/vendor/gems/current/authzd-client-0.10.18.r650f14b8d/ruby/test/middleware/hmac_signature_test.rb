# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Middleware
    class HmacSignatureTest < Minitest::Test

      EnumeratorStub = Class.new
      HMAC_KEY       = "test-key"

      def setup
        @enumerator_request = Authzd::Enumerator::ForSubjectRequest.new
        @enumerator = EnumeratorStub.new

        options = { key: HMAC_KEY }
        @middleware = Middleware::HmacSignature.new(**options).tap do |middleware|
          middleware.request = @enumerator
        end
      end

      def test_adds_hmac_header
        timestamp = Time.now.to_i.to_s
        Middleware::HmacSignature.any_instance.stubs(:header_timestamp).returns(timestamp)
        hmac = OpenSSL::HMAC.hexdigest(Middleware::HmacSignature::ALGORITHM, HMAC_KEY, timestamp)
        key = "#{timestamp}.#{hmac}"

        expected_metadata = { "Request-HMAC" => key }
        @enumerator.expects(:perform).once.with(@enumerator_request, expected_metadata)
        @middleware.perform(@enumerator_request)
      end
    end
  end
end
