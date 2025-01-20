# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        module FromOSVRangeParsers
          # Result class for the OSV parsers.
          class ParsedTerm
            attr_reader :type, :version, :comparator, :custom_version_object
            attr_accessor :hidden

            def initialize(type:, version:, comparator:, hidden: false, custom_version_object: nil)
              @type = type
              @version = version
              @comparator = comparator
              @hidden = hidden
              # This is a custom version object that an individual parser can use to store
              # details that are specific to the type of range being parsed.
              @custom_version_object = custom_version_object
            end
          end
        end
      end
    end
  end
end
