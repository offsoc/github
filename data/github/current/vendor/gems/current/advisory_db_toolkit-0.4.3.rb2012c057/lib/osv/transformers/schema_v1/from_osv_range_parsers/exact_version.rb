# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        module FromOSVRangeParsers
          # Special case of a range parser that just parses a single version.
          # Example of a single_version: "1.2.3"
          # The way we keep track of the fixed version is using hidden segments, so this
          # accepts the range and last_known_affected in order to
          # generate the osv parsed segments.
          # This parser just ignores everything but the hidden fixed element.
          module ExactVersion
            def self.parse(single_version, range, last_known_affected)
              parsed_segments = []
              terms = []
              terms.push(ParsedTerm.new(
                type: :single_version,
                version: single_version,
                comparator: "=",
              ))
              osv_parsed_segments = range && FromOSVRangeParsers::Parser.parse(range, last_known_affected).parsed_segments
              # Check if osv_parsed_segments is not present, which might the case when ranges array is empty on the OSV data.
              if AdvisoryDBToolkit::Utility.present?(osv_parsed_segments)
                first_fixed_term = FromOSVRangeParsers::Parser.first_term(osv_parsed_segments) do |term|
                  term.type == :fixed
                end
                if AdvisoryDBToolkit::Utility.present?(first_fixed_term)
                  first_fixed_term.hidden = true
                  terms.push(first_fixed_term)
                end
              end
              parsed_segments.push(terms)
              parsed_segments
            end
          end
        end
      end
    end
  end
end
