#!/usr/bin/env safe-ruby
# frozen_string_literal: true

require "/github/config/environment"

def main
    unless GitHub.actions_enabled?
        @logger.info "Unable to retrieve self-hosted runners list as Actions is disabled."
        exit 1
    end
    begin
        Business.all.each do |b|
            @logger.info "Self-Hosted Runners for Enterprise '#{b.name}'(#{b.slug}):"
            Actions::RunnerGroup.for_entity(b, include_runners: true).each do |g|
                g.runners.each { |r| log_entry(runner: r, runner_group: g) }
            end
            @logger.info "\n"
            b.organizations.each do |o|
                @logger.info "Self-Hosted Runners for Organization #{b.slug}/#{o.login}:"
                Actions::RunnerGroup.for_entity(o, include_runners: true).each do |g|
                    g.runners.each { |r| log_entry(runner: r, runner_group: g) }
                end
                @logger.info "\n"
            end
        end
    rescue StandardError => e
        @logger.info "Unexpected error occurred: #{e.class} - #{e.message}"
    end
end

def log_entry(runner:, runner_group:)
    inherited = runner_group.instance_variable_get(:@owner_id)&.global_id.present?
    @logger.info(%W[
        \t id:'#{runner.id}'
        name:'#{runner.name}'
        os:'#{runner.os}'
        labels:'#{runner.labels.flat_map(&:name)}'
        runner_group:'#{runner_group.name}'
        status:'#{runner.status}'
        inherited:'#{inherited}'
        ].join(' ')
    )
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
