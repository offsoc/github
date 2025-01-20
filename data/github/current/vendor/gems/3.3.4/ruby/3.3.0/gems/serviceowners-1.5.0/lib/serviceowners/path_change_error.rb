# typed: true
# frozen_string_literal: true

require_relative "error"

module Serviceowners
  # Error raised when one of the files being examined (changed) doesn't match serviceowner expectations.
  class PathChangeError < Error
    MESSAGE = <<~MSG
      The following files have SERVICEOWNERS errors. Please fix the SERVICEOWNERS entry for each, commit, and push again.

    MSG

    def initialize(path_status_messages)
      @path_status_messages = path_status_messages
      super(MESSAGE + path_status_messages.join("\n"))
    end

    attr_reader :path_status_messages
  end
end
