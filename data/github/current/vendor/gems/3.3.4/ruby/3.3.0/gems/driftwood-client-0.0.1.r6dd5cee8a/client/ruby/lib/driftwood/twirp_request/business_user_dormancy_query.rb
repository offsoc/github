# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class BusinessUserDormancyQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        klass = get_request_class("BusinessUserDormancy")

        klass.new(
          user_id: options[:user_id],
          business_id: options[:business_id],
        )
      end

      def client_method
        :query_business_user_dormancy
      end
    end
  end
end
