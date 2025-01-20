# frozen_string_literal: true

module Driftwood
  class SearchResults
    include Enumerable
    extend Forwardable

    attr_reader :results,
      :total_count,
      :took,
      :query_errors,
      :aggregations,
      :parsed_query,
      :request,
      :cost,
      :warnings,
      :version

    def_delegators :request,
      :has_next_page?,
      :has_previous_page?,
      :after_cursor,
      :before_cursor

    def initialize(resp, req, version)
      @request = req
      @version = version

      # Gross hack for dealing with the GetAuditEntryResponse type.
      if resp.respond_to?(:document)
        if resp.document.empty?
          @results = []
          @total_count = 0
        else
          @results = [JSON.parse(resp.document, symbolize_names: true)]
          @total_count = 1
        end
      # Another gross hack to deal with the BusinessUserDormancyQuery
      elsif resp.respond_to?(:most_recent_timestamp)
        @results = [{"@timestamp": resp.most_recent_timestamp}]
        @total_count = 1
      else
        @results = resp.results.reject(&:empty?).map { |r| JSON.parse(r, symbolize_names: true) }
        @total_count = resp.total_count
        @took = resp.took
        @query_errors = resp.query_errors
        @warnings = resp.warnings
      end

      if resp.respond_to?(:aggregations)
        @aggregations = resp.aggregations
      end

      if resp.respond_to?(:parsed_query)
        @parsed_query = resp.parsed_query
      end

      if resp.respond_to?(:cost)
         @cost = resp.cost
      end
    end

    def each(&block)
      results.each(&block)
    end

    def empty?
      results.empty?
    end

    def size
      results.size
    end
    alias :length :size

    def [](index)
      results[index]
    end

    def total
      @total_count
    end
  end
end
