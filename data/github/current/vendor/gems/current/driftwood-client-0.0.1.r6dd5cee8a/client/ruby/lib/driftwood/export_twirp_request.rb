# frozen_string_literal: true

require "faraday"
require_relative "../driftwood/twirp_util"

module Driftwood
  module ExportTwirpRequest
    include Driftwood::TwirpUtil
    extend Forwardable

    class Error < StandardError
      attr_reader :twirp_response

      def initialize(twirp_response: nil)
        @twirp_response = twirp_response
      end
    end

    attr_reader :client,
      :request,
      :version


    def_delegators :request

    def initialize(client, options = {})
      @client = client
      @version = options.delete(:version) || :v0
      @request = build_request(options)
    end

    def execute
      execute_query(client: client)
    end

    def is_v1?
      @version == :v1
    end

    def get_request_class(name, v2: false)
      request_version = ""
      if is_v1?
        request_version = "::V1"
      end

      export_version = ""
      if v2
        export_version = "V2"
      end

      "Driftwood::Auditlog#{request_version}::#{name}Request#{export_version}".constantize
    end
  end
end
