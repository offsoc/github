# typed: true
# frozen_string_literal: true

require "parallel"

module Serviceowners
  # Encapsulation of metric data about the given service, based on the paths
  # with which it is associated.
  class Metrics
    def initialize(service)
      @service = service
      @paths = []
    end

    attr_reader :service, :paths

    def ruby_paths
      @paths.select { |p| p.end_with?(".rb") }
    end

    def push_path(path)
      @paths << path
    end

    def file_count
      ruby_paths.count
    end

    def line_count
      Parallel.map(ruby_paths) { |path| path_line_count(path) }.reduce(:+)
    end

    def <=>(other)
      return 1 if service.nil?
      return -1 if other.service.nil?

      service <=> other.service
    end

    private

    def path_line_count(path)
      File.foreach(path).inject(0) do |total, line|
        line = line.strip
        next total if line.empty?
        next total if line.start_with?("#")
        next total if line == "end"

        total + 1
      end
    end
  end
end
