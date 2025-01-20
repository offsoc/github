# frozen_string_literal: true
# Patch ActiveJob logger

require "active_job/logging"

module ActiveJob
  module Logging

    # Uses a tagged logger instance but omits unnamed tags of job.class.name and job.id
    # https://github.com/rails/rails/blob/v7.0.5/activejob/lib/active_job/logging.rb#L18
    def perform_now
      tag_logger { super }
    end

    private

    # Omits the unnamed tag `ActiveJob`
    # From https://github.com/rails/rails/blob/v7.0.5/activejob/lib/active_job/logging.rb#LL31C6-L31C39
    def logger_tagged_by_active_job?
      true
    end
  end
end
