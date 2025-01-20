# frozen_string_literal: true

module Authnd
  module Client
    module ServiceClientTestHelpers
      UNREACHABLE_TWIRP_URL = "http://127.0.0.1:8001/twirp/"
      TEST_CATALOG_SERVICE = "github/test-service"

      def test_connection
        @test_connection ||= Faraday.new(url: UNREACHABLE_TWIRP_URL)
      end

      def stub_twirp_client(service, method, expected_request, mock_response)
        service.instance_eval do
          @twirp_client.expects(method).with(expected_request, { headers: {} }).returns(mock_response)
        end
      end

      def stub_twirp_client_with_raise(service, method, expected_request, raise_with)
        service.instance_eval do
          @twirp_client.expects(method).with(expected_request, { headers: {} }).raises(raise_with)
        end
      end
    end
  end
end
