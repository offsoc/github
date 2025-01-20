#!/usr/bin/env safe-ruby
# frozen_string_literal: true

require "/github/config/environment"

def main
    begin
      business = GitHub.global_business
      @logger.info "Configuration Entries for Enterprise '#{business.name}'(#{business.slug}):"

      retention = AuditLogSettings.retention_months.value

      @logger.info "Retention Months - #{retention == "inf" ? "infinite" : retention}"
      @logger.info "Git Events Enabled - #{AuditLogSettings.git_events_enabled?}"
      @logger.info "\n"

      business.audit_log_stream_configurations.all.each do |stream_config|
        @logger.info "Stream Configuration:"
        @logger.info "Enabled: #{stream_config.enabled}"
        @logger.info "Stream Type: #{stream_config.sink.sink_type}"
        @logger.info "Stream Details: #{stream_config.sink.sink_details}"
        @logger.info "Created at: #{stream_config.created_at}"
        @logger.info "Updated at: #{stream_config.updated_at}"
        @logger.info "Paused at: #{stream_config.paused_at}"
        @logger.info "\n"
      end
    rescue StandardError => e
        @logger.info "Unexpected error occurred: #{e.class} - #{e.message}"
    end
end

def get_logger
    logger = Logger.new(STDOUT)
    logger.level = Logger::INFO
    logger.formatter = proc do |severity, datetime, _progname, msg|
      "#{msg}\n"
    end
    return logger
end

@logger = get_logger

main
