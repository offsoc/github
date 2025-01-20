# typed: true
# frozen_string_literal: true

module Serviceowners
  # A simple container class representing a change to a path and its git status
  class PathStatus
    def initialize(path_status_line)
      @status, @path = path_status_line.split("\t")
    end

    attr_reader :path, :status

    # Public: Is this a valid change for the given service patterns? If not, returns
    # an error message describing the problem. Otherwise returns nil.
    def error_message(service_patterns, file_index)
      spec = service_patterns.match(path)

      if spec.nil?
        "#{path} (Missing SERVICEOWNERS entry)" if created? || modified?
      elsif deleted?
        return "#{path} (File deleted but SERVICEOWNERS entry remains)" if spec.pattern.file?

        "#{path} (Last path matching `#{spec.pattern.text}` removed)" unless file_index.any_file?(spec.pattern)
      end
    end

    def deleted?
      status == "D"
    end

    def modified?
      status == "M"
    end

    def created?
      status == "A"
    end
  end
end
