# frozen_string_literal: true

module ElastomerClient
  class VersionSupport

    attr_reader :version

    # version - an Elasticsearch version string e.g., 5.6.6 or 8.7.0
    #
    # Raises ArgumentError if version is unsupported.
    def initialize(version)
      if version < "5.0" || version >= "9.0"
        raise ArgumentError, "Elasticsearch version #{version} is not supported by elastomer-client"
      end

      @version = version
    end

    # Returns true if Elasticsearch version is 8.x or higher.
    def es_version_8_plus?
      version >= "8.0.0"
    end
  end
end
