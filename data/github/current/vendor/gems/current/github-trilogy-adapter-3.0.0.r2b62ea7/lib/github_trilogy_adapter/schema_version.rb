# frozen_string_literal: true

module GitHubTrilogyAdapter
  module SchemaVersion
    SCHEMA_VERSION = "v5"
    DEFAULT_SQL_STRUCTURE_PATH = "db/structure.sql"

    # github/github has a non-standard migrations setup (migrations for all
    # databases in the same directory, and only mysql1 has a schema_migrations
    # table). Without this override, we'd get a reasonable-looking schema version
    # for mysql1, and 0 for all the other dbs. With the override, the schema
    # version for every db will be based on the contents of structure.sql (which
    # includes all the schema_migrations values).
    #
    # We don't strictly need this. GitHub sets `check_schema_cache_dump_version`
    # to `false`, so at the time of writing we don't use `schema_version` for
    # anything.
    def schema_version
      path = if defined?(Rails.root)
        File.join(Rails.root, DEFAULT_SQL_STRUCTURE_PATH)
      else
        DEFAULT_SQL_STRUCTURE_PATH
      end

      Digest::SHA1.file(path).hexdigest + SCHEMA_VERSION
    end
  end
end
