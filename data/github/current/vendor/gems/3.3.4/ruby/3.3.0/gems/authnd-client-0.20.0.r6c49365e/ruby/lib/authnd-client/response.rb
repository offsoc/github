# frozen_string_literal: true

module Authnd
  class Response
    attr_accessor :attributes, :result

    def initialize(result, attributes)
      @result = result
      @attributes = attributes
    end

    def self.from_twirp(twirp_response)
      attributes = Authnd::Response.unwrap_attributes(twirp_response.attributes)
      Response.new(twirp_response.result, attributes)
    end

    def success?
      @result == :RESULT_SUCCESS
    end

    def self.unwrap_attributes(proto_attrs)
      attributes = {}
      proto_attrs.each do |attr|
        attributes[attr.id] = attr.value.unwrap
      end

      attributes
    end
  end
end
