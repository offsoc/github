# frozen_string_literal: true

require "active_support/inflector"

module ServiceCatalog
  class Client
    # Response encapsulates the query response JSON into a Ruby class for easier introspection and code readability.
    class Response
      # Read the data from the response. Access properties from the GraphQL query as lower_snake_case attributes.
      # @return [Struct]
      attr_reader :data

      # Any errors the server may have returned. Usually a malformed query.
      # @return [Array]
      attr_reader :errors

      # PartialSuccessError denotes a 200 response from the GraphQL server with values in the +"errors"+ key in the response.
      class PartialSuccessError < Client::Error
      end

      KEY_TRANSFORMATIONS = {
        "percentMet24h" => :percent_met_24h,
        "percentMet28d" => :percent_met_28d,
        "percentMet13w" => :percent_met_13w,
      }

      # Create a new Response.
      #
      # @param data_hash A Hash of data containing at most two keys, one "errors", and one corresponding to your response data.
      #
      # @return nil
      def initialize(data_hash = {})
        @errors = data_hash.delete("errors") || []
        raise PartialSuccessError, errors if errored?
        @data = convert_to_rubyish(data_hash.values.first)
      end

      def errored?
        !errors.empty?
      end

      private
      def convert_to_rubyish(data)
        case data
        when Array
          data.map { |element| convert_to_rubyish(element) }
        when Hash
          return Object.new if data.empty?
          keys = data.keys.map { |key| KEY_TRANSFORMATIONS[key] || ActiveSupport::Inflector.underscore(key).to_sym }
          Struct.new(*keys).new(*convert_to_rubyish(data.values))
        else
          data
        end
      end
    end
  end
end
