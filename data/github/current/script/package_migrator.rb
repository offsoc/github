#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

# See docs on The Hub: https://thehub.github.com/epd/engineering/products-and-services/dotcom/app-partitioning/tools/#package_migrator-script

require "github/packwerk/package_migrator"
require "optparse"

options = {}

parser = OptionParser.new do |opts|
  opts.banner = "Usage: bin/package_migrator.rb [--service] [--dry-run] package_name path_prefix"

  opts.on("--service SERVICE_NAME", "Limit the import to files of the given service.") do |service_name|
    options[:service_name] = service_name
  end

  opts.on(
    "--dry-run",
    "Display changes to be made without taking action."
  ) do
    options[:dry_run] = true
  end

end
parser.parse!

package_name, path_prefix = parser.order!

puts "Error: Missing package name." if package_name.nil?
puts "Error: Missing path prefix." if path_prefix.nil?

if package_name.nil? || path_prefix.nil?
  puts parser.banner
  exit 1
end

GitHub::Packwerk::PackageMigrator.new(package_name:, path_prefix:, **options).move_to_package

exit 0
