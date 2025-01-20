# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transform
      extend self

      CURRENT_SCHEMA_VERSION = "1.4.0"
      DEFAULT_SCHEMA_VERSION = "1.4.0"

      Error = Class.new(StandardError)
      UnknownSchemaVersionError = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

      # Transform an Advisory interface object to a hash of OSV data
      def to_osv(advisory)
        transformer = transformer_for(CURRENT_SCHEMA_VERSION)
        transformer.to_osv(advisory)
      end

      # Transform a hash of OSV data to an Advisory interface object
      #
      # TODO: Can we remove `affected_function_extractor` since it isn't
      # actively used anywhere right now? Is it more appropriate for the
      # interface to impliment?
      def from_osv(osv_data, affected_function_extractor: nil)
        transformer = transformer_for(osv_data["schema_version"])
        transformer.from_osv(osv_data,
          affected_function_extractor: affected_function_extractor)
      end

      # The schema_version field is used to indicate which version of the OSV
      # schema a particular vulnerability was exported with. This can help
      # consumer applications decide how to import the data for their own systems
      # and offer some protection against future breaking changes. The value
      # should be a string matching the OSV Schema version, which follows the
      # SemVer 2.0.0 format, with no leading "v" prefix. If no value is
      # specified, it should be assumed to be 1.0.0, matching version 1.0 of the
      # OSV Schema. Clients can assume that new minor and patch versions of the
      # schema only add new fields, without changing the meaning of old fields,
      # so that a client that knows how to read version 1.2.0 can process data
      # identifying as schema version 1.3.0 by ignoring any unexpected fields.
      def transformer_for(schema_version)
        schema_version = DEFAULT_SCHEMA_VERSION unless AdvisoryDBToolkit::Utility.present?(schema_version)

        if Gem::Dependency.new("", "~> 1.0").match?("", schema_version)
          ::AdvisoryDBToolkit::OSV::Transformers::SchemaV1
        else
          raise UnknownSchemaVersionError, "#{schema_version} is not a known OSV schema version"
        end
      end
    end
  end
end
