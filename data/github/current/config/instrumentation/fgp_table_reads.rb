# frozen_string_literal: true

module FineGrainedPermissions
  class FgpTableReadError < StandardError
    def initialize(query, frame)
      @query = query
      @frame = frame
      super("Unwanted read on FGP table: `%s` from `%s`. Reach out to #authorization for assistance." % [query, frame])
    end

    def tags
      @tags ||= begin
        ts = []
        if match = @frame.to_s.match(/(.*):(\d+)(?::in `([^']+)')?/) # taken from Rollbar gem
          filename, _lineno, method = match[1], match[2], match[3]

          ts.push("file:#{File.basename(filename)}")

          if method
            method = method.sub(/_erb__[_\d]+\z/, "_erb") # scrub generated ERB method names
            ts.push("method:#{method}")
          end
        end
        ts
      end
    end
  end

  class ReadsSubscriber
    # system_roles.rb is ignored because it will be udpated in the near future so that it:
    # * does not write FGPs
    # * does not set role_permission.fine_grained_permission_id
    # At that point, it will only update system roles (roles and role_permissions tables)
    # We will only do this once we are sure the FGP table is no longer being read from, except for reads made in service of writes.
    # Until then, we don't need to worry about FGP reads from this file.
    IGNORED = [
      "lib/github/transitions/",
      "db/migrate/",
      "packages/app_security/app/models/permissions/system_roles.rb",
      "test/test_helpers/fixtures.rb",
      "test/factories/role_permission_factories.rb",
      "_test.rb",
      "test/test_helpers/fine_grained_permissions_test_helper.rb",
      "github/lib/tasks/",
      "bin/tapioca"
    ].freeze

    AUDITED_COMMENT = "allowed-fgp-read".freeze
    UNSAFE_QUERY_PATTERN = /(from|join)\s+`?fine_grained_permissions`?\s*/i

    def call(event, start, ending, transaction_id, payload)
      query, query_comment = payload[:sql].split("/*", 2)

      if unsafe_query?(query)
        return if query_comment&.include?(AUDITED_COMMENT)

        frame = Rollup.first_significant_frame(caller)
        return if ignored?(frame)

        error = FgpTableReadError.new(payload[:sql], frame)
        GitHub.dogstats.increment("fine_grained_permission.reads", tags: error.tags)

        if raise_unsafe?
          raise error
        else
          error.set_backtrace(caller)
          Failbot.report!(error, app: "github-fine-grained-permission-reads")
        end
      end
    end

    private

    def unsafe_query?(query)
      query.downcase =~ UNSAFE_QUERY_PATTERN
    end

    def ignored?(frame)
      IGNORED.any? { |sf| frame.include?(sf) }
    end

    def raise_unsafe?
      Rails.env.development? || Rails.env.test?
    end

  end
end

ActiveSupport::Notifications.subscribe "sql.active_record", FineGrainedPermissions::ReadsSubscriber.new
