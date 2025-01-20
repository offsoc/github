# frozen_string_literal: true
# This script is used to reconcile unused external dependency declarations
# in package.yml files
# Usage: bin/safe-ruby script/packages/remove_unused_dependency_declarations.rb

require "yaml"
require "open3"

def parse_package(file_path)
  match = /packages\/(?<package_name>\w+)\//.match(file_path)
  match["package_name"]
end

def parse_rubocop_output(output)
  dependencies = output.scan(/please add (?<dependency>mysql\/[\w-]+)/)
  dependencies.flatten.uniq.sort
end

package_files = Dir.glob("packages/**/package.yml")

package_files.each do |package_file|
  package_name = parse_package(package_file)
  puts "Checking external dependencies for packages/#{package_name}"
  package_contents = YAML.load_file(package_file)
  declared_deps = package_contents.dig("metadata", "external_dependencies")

  next unless declared_deps

  package_contents["metadata"]["external_dependencies"] = []
  File.open(package_file, "w") { |f| f.write(package_contents.to_yaml) }
  stdout, stderr, status = Open3.capture3("bin/rubocop --only Lint/ExternalDependencies packages/#{package_name}/.")
  current_deps = parse_rubocop_output(stdout)
  package_contents["metadata"]["external_dependencies"] = current_deps

  File.open(package_file, "w") { |f| f.write(package_contents.to_yaml) }
end
