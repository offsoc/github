# typed: true
# frozen_string_literal: true

require "github/sql/digester"

module QueryWarningsAction
  class QueryWarning < StandardError
    attr_reader :sql, :level, :code, :message

    def initialize(sql, level, code, message)
      @sql, @level, @code, @message = sql, level, code, message

      super "[#{level}] #{code}: #{message}\n\n#{sql}"
    end
  end

  IGNORED_WARNINGS = [
    # ER_DUP_ENTRY and ER_DUP_ENTRY_WITH_KEY_NAME should not raise warning
    # to Sentry as these warnings can happen anywhere INSERT IGNORE is used
    # and a duplicate exists. INSERT IGNORE is currently used heavily by
    # GitHub::Migrator.
    /1062/,
    /1586/,

    # Unsafe statement written to the binary log using statement format since
    # BINLOG_FORMAT = STATEMENT. INSERT... ON DUPLICATE KEY UPDATE on a table
    # with more than one UNIQUE KEY is unsafe:
    /1592/,

    /Column 'subgroup' cannot be null/,

    # Setting `NO_AUTO_CREATE_USER` in MySQL 8+ causes connections to be rejected, but not setting
    # it in 5.7 causes a query warning. This mode is only relevant if the user has GRANT privileges,
    # which none of our users do, so we can simply ignore this warning.
    /Changing sql mode 'NO_AUTO_CREATE_USER' is deprecated. It will be removed in a future release\./,

    # Deprecated in mysql 8, but the alternative is unsupported in 5.7.
    # Ignore the query warning for now until all databases are upgraded to 8.0+
    /'VALUES function' is deprecated and will be removed in a future release\./,

    # Optimizer hints are not a problem unless it's an error.
    /Optimizer hint syntax error/,

    # As of https://github.com/rails/rails/commit/db3d6924a898b63a376ad752eb9e2d71af5c511d, query warnings
    # that are not revealed through `SHOW WARNINGS` are no longer completely ignored. Instead this generic
    # warning is raised. Unfortunately, this warning isn't actionable and leads to a lot of noise as its
    # sent to Failbot. We can safely ignore but may want to revisit in the future.
    /Query had warning_count=\d+ but ‘SHOW WARNINGS’ did not return the warnings/,
  ].freeze

  class << self
    def to_proc
      method(:call).to_proc
    end

    def call(warning)
      digested_sql = GitHub::SQL::Digester.digest_sql(warning.sql)
      error = QueryWarning.new(digested_sql, warning.level, warning.code, warning.message)
      error.set_backtrace(caller)
      report(error)
    end

    private

    def report(error)
      Failbot.report(
        error,
        rollup: Digest::SHA256.hexdigest(error.sql),
        sql_sanitized: error.sql,
        app: "github-query-warning",
      )
    end
  end
end
