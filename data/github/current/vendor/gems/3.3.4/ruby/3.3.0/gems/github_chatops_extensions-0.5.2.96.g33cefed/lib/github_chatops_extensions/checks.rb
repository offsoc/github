# frozen_string_literal: true

# Include just the checks.

require "pathname"

basedir = Pathname.new(__dir__)
Dir.glob(File.join(__dir__, "checks", "*.rb")).each do |file|
  path = Pathname.new(file).relative_path_from(basedir).sub(/\.rb\z/, "").to_s
  require_relative path
end
