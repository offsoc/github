# frozen_string_literal: true

require_relative "../driftwood/search_results"
require_relative "../driftwood/twirp_util"

module Driftwood
  module TwirpRequest
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
      :parsed_query,
      :after_cursor,
      :before_cursor,
      :version

    def_delegators :request,
      :per_page,
      :per_page=,
      :after,
      :after=,
      :before,
      :before=

    def initialize(client, options = {})
      @client = client
      @version = options.delete(:version) || :v0
      # we need to convert the phrase so that it's always a string
      # See https://sentry.io/organizations/github/issues/2064388917/
      # and https://sentry.io/organizations/github/issues/2064510970/
      # This will always make it a string, even if it's nil
      # a phrase of an empty string is ok, since that's the default anyway
      options[:phrase] = options[:phrase].to_s
      @request = build_request(options)
    end

    def execute(sanitize: false)
      data = execute_query(client: client)
      extract_data_from_response(data)
      Driftwood::SearchResults.new(data, self, version)
    end

    def has_next_page?
      after_cursor.present?
    end

    def has_previous_page?
      before_cursor.present?
    end

    def qualifiers
      return {} unless @parsed_query

      @parsed_query[:qualifiers]
    end

    def is_v1?
      version == :v1
    end

    def get_request_class(name)
      request_version = ""
      if is_v1?
        request_version = "::V1"
      end

      "Driftwood::Auditlog#{request_version}::#{name}Request".constantize
    end

    private

    def extract_data_from_response(data)
      if data.respond_to?(:after) && data.after.present?
        @after_cursor = data.after
      end
      if data.respond_to?(:before) && data.before.present?
        @before_cursor = data.before
      end
      if data.respond_to?(:parsed_query) && data.parsed_query.present?
        @parsed_query = JSON.parse(data.parsed_query, symbolize_names: true)
      end
    end
  end
end
