module Hydro
  module Topic
    module FormatVersion
      class V1
        DEFAULT_SITE = "cp1-iad"
        DEFAULT_NAMESPACE = "ingest"

        def self.format(name:, site: DEFAULT_SITE, namespace: DEFAULT_NAMESPACE, **)
          if site.nil? || site.empty?
            raise ArgumentError.new("site must be non-empty")
          end
          if namespace.nil? || namespace.empty?
            raise ArgumentError.new("namespace must be non-empty")
          end

          "#{site}.#{namespace}.#{name.sub(HYDRO_SCHEMAS_PREFIX, "")}"
        end
      end

      class V2
        def self.format(name:, **)
          name.sub(HYDRO_SCHEMAS_PREFIX, "")
        end
      end
    end

    DEFAULT_FORMAT_OPTIONS = {
      format_version: FormatVersion::V2,
    }

    HYDRO_SCHEMAS_PREFIX = /\Ahydro\.schemas\./

    # Public: Formats a Hydro topic by delegating to the format method
    # associated with format_version passing along the name and any
    # format_version specific options.
    #
    # format_version - Required format version - a class that implements
    #                  `.format(**options), see Hydro::Topic::FormatVersion for
    #                  examples.
    # name           - Required name component specific to format_version.
    #
    # Example:
    #
    #   # returns "cp1-iad.ingest.octochat.v0.Login"
    #   Hydro::Topic.format(
    #     format_version: Hydro::Topic::FormatVersion::V1,
    #     site: "cp1-iad",
    #     namespace: "ingest",
    #     name: "octochat.v0.Login"
    #   )
    #
    #   # returns "octochat.v0.Login"
    #   Hydro::Topic.format(
    #     format_version: Hydro::Topic::FormatVersion::V2,
    #     name: "octochat.v0.Login"
    #   )
    def self.format(format_version:, name:, **options)
      if name.nil? || name.empty?
        raise ArgumentError.new("name must be non-empty")
      end

      format_version.format(name: name, **options)
    end
  end
end
