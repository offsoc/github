#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "open3"
require "optparse"

current_dir = File.dirname(__FILE__)
subproject_config_contents = File.read(File.expand_path("../subproject-to-image-map.json", current_dir))
subproject_config_map = JSON.parse(subproject_config_contents)

head_ref = ENV["HEAD_REF"]
base_ref = ENV["BASE_REF"]

puts "HEAD REF #{head_ref}\nBASE REF #{base_ref}"

if head_ref.nil? || head_ref.empty? || base_ref.nil? || base_ref.empty?
  STDERR.puts "ERROR: HEAD_REF and BASE_REF environment variables must be set."
  exit 1
end

fetch_cmd = "git fetch --depth=1 origin #{base_ref}"
stdout, stderr, status = Open3.capture3(fetch_cmd)
if !status.success?
  STDERR.puts "ERROR: unable to `git fetch` branches #{base_ref}. We suggest you retry the job."
  exit 1
end

files_changed_cmd = "git diff --name-only origin/#{base_ref}"

stdout, stderr, status = Open3.capture3(files_changed_cmd)
if !status.success?
  STDERR.puts "ERROR: unable to `git diff` files changed between #{head_ref} and #{base_ref}. We suggest you retry the job."
  STDERR.puts "Stderr: #{stderr}"
  STDERR.puts "#{files_changed_cmd}"
  exit 1
end
puts "The files changed between #{base_ref} and #{head_ref} are: \n#{stdout}"
matched = false

files_changed = stdout.split(/\n/)
files_changed.each do |file|
  if subproject_config_map.include?(file)
    puts "Found subproject version file change: #{file}"
    matched = true

    sha = nil
    File.open(file) { |sha_file|
      sha_file.each_line do |line|
        # Some version files have comments, this ignores any lines that are comments
        if /^[^#].*$/.match?(line.strip!)
          sha = line.strip
        end
      end
    }

    sha_has_container_command = "docker manifest inspect #{subproject_config_map[file]}:#{sha}"
    stdout, stderr, status = Open3.capture3(sha_has_container_command)
    if !status.success?
      if stderr.include?("manifest unknown")
        STDERR.puts "ERROR:  The config on master for #{file} has an associated container.
        The new sha #{sha} for repository #{subproject_config_map[file]} does not have a container.
        Please ensure the sha has an associated container. A common pattern is to only build containers from commits to master/main for example:
        https://gh.io/create-ci-action-to-build-your-container
        You may need to choose the merge commit sha to get a corresponding container"
      else
        STDERR.puts "Unknown error encountered while checking for container for #{sha} for repository #{subproject_config_map[file]}."
        STDERR.puts "Stderr: #{stderr}"
      end
      exit 1
    else
      puts "Found container for #{sha} for repository #{subproject_config_map[file]}"
    end
  end
end

if !matched
  puts "No subproject version file changes found"
else
  puts "All subproject version file changes have associated containers"
end
