#!/usr/bin/env safe-ruby
# frozen_string_literal: true

require "/github/config/environment"

def main
    @log_entry = lambda { |e| @logger.info "\t #{e.name} - value:'#{e.value}' last_updated:'#{e.updated_at}'" }
    begin
        Business.all.each do |b|
            @logger.info "Configuration entries for Enterprise '#{b.name}'(#{b.slug}):"
            b.configuration_entries.each { |e| @log_entry.call(e) }
            @logger.info "\n"
            b.organizations.each do |o|
                @logger.info "Configuration entries for Organization #{b.slug}/#{o.login}:"
                o.configuration_entries.each { |e| @log_entry.call(e) }
                @logger.info "\n"
            end
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
