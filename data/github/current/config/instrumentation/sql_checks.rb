# frozen_string_literal: true
# rubocop:disable GitHub/DoNotBranchOnRailsEnv

# This code add checks for SQL statements and transactions.
# It is designed to use a single sql.active_record subscription as it is extremely expensive to do otherwise.

# Instrument unless we're currently running in enterprise mode, or in the test environment
# without explicitly enabling via ENV["PERFORM_STATEMENT_CHECKING"]
unless GitHub.enterprise? || GitHub.skip_statement_checking?
  statement_checkers = []

  # Common settings for checks

  report_errors = Rails.env.production? # report only in production environment
  raise_errors  = !Rails.env.production? # raise only in non-production environments
  sample_rate   = (Rails.env.production? || ENV["FASTDEV"].present?) ? 0.01 : 1.0 # Only execute the sampled check 1% of the time in production since it can be expensive

  # Setup Cross Schema Domain Checks

  statement_stats_reporter = Instrumentation::StatsReporter.new

  statement_checkers << Instrumentation::SampledChecker.new(
    sample_rate: sample_rate,
    checker: GitHub::SQLCheckers::SchemaDomain::StatementChecker.new(
      checking_transactions: false,
      report_errors: report_errors,
      raise_errors: raise_errors,
      stats_reporter: statement_stats_reporter
    )
  )

  # Setup Table Sharding Checks

  statement_checkers << Instrumentation::SampledChecker.new(
    sample_rate: sample_rate,
    checker: GitHub::SQLCheckers::TableSharding::StatementChecker.new(
      report_errors: report_errors,
      raise_errors: raise_errors,
      stats_reporter: statement_stats_reporter
    )
  )

  statement_checkers << Instrumentation::SampledChecker.new(
    sample_rate: sample_rate,
    checker: GitHub::SQLCheckers::Authorization::StatementChecker.new(
      checking_transactions: false,
      report_errors: report_errors,
      raise_errors: raise_errors,
      stats_reporter: statement_stats_reporter
    )
  )

  statement_checkers << Instrumentation::SampledChecker.new(
    sample_rate: sample_rate,
    checker: GitHub::SQLCheckers::TenantNamespacing::StatementChecker.new(
      checking_transactions: false,
      report_errors: report_errors,
      raise_errors: raise_errors,
      stats_reporter: statement_stats_reporter
    )
  )

  statement_checkers << Instrumentation::SampledChecker.new(
    sample_rate: 1.0, # The only time we sample in prod is for staff so do it 100% of the time
    checker: GitHub::SQLCheckers::DomainIsolation::TablesStatementChecker.new(
      checking_transactions: false,
      report_errors: false,
      raise_errors: Rails.env.test?,
      log_errors: !Rails.env.test? && ENV["FASTDEV"].nil?,
      stats_reporter: statement_stats_reporter
    )
  )

  # Add subscriptions only if necessary

  if statement_checkers.size > 0
    query_subscriber = Instrumentation::QuerySubscriber.new(checkers: statement_checkers)
    ActiveSupport::Notifications.subscribe "sql.active_record", query_subscriber
  end
end
