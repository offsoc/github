#!/usr/bin/env ruby
# frozen_string_literal: true

require "open3"
require "tmpdir"

SUBPROJECT_REPOS = {
  "alambic" => "config/alambic-version",
  # "alive" => "config/alive-version", # built into golden image
  # "aqueduct-lite" => "config/aqueduct-lite-version", # built into golden image
  "authzd" => "config/authzd-version",
  # "babeld" => "config/babeld-version", # built into golden image
  # "codeload" => "config/codeload-version", # built into golden image
  # "dev-identity-provider-ruby" => "config/dev-identity-provider-ruby-version", # built into golden image
  # "gitrpcd" => "config/gitrpcd-version", # built into golden image via git
  # "gpgverify" => "config/gpgverify-version", # built into golden image
  "hookshot-go" => "config/hookshot-go-version",
  # "lfs-server" => "config/lfs-server-version", # built into golden image
  # "librarian" => "config/librarian-version", # built into golden image
  "memory-alpha" => "config/memory-alpha-version",
  "notifyd" => "config/notifyd-version",
  "registry" => "config/registry-version",
  # "spokesd" => "config/spokesd-version", # built into golden image via git
  "treelights" => "config/treelights-version",
  "turboghas" => "config/turboghas-version",
  # "turboscan" => "config/turboscan-version", # this doesn't exist anymore?
  "voltron" => "config/voltron-version",
}

def run_cmd(cmd, working_dir: ".")
  stdout, stderr, status = Open3.capture3(cmd, chdir: working_dir)
  status.success?
end

def check_subproject_fetchable(subproject_name, subproject_sha)
  temp_dir_for_git_operations = Dir.mktmpdir
  begin
    subproject_dir = File.join(temp_dir_for_git_operations, subproject_name)
    FileUtils.mkdir_p(subproject_dir)
    gh_clone_url = `script/gh-clone-url github/#{subproject_name}`.chomp

    return false unless create_repo(subproject_name, subproject_dir)
    return false unless add_origin(subproject_name, gh_clone_url, subproject_dir)
    return false unless fetch_ref(subproject_name, subproject_sha, subproject_dir)

    puts "Verified #{subproject_name} sha #{subproject_sha} is available"
    true
  ensure
    FileUtils.remove_entry(temp_dir_for_git_operations)
  end
end

def create_repo(subproject_name, subproject_dir)
  create_repo_cmd = "git init"
  unless run_cmd(create_repo_cmd, working_dir: subproject_dir)
    puts "ERROR: unable to init repo for #{subproject_name}"
    return false
  end

  true
end

def add_origin(subproject_name, gh_clone_url, subproject_dir)
  add_git_remote_origin_cmd = "git remote add origin #{gh_clone_url}"
  unless run_cmd(add_git_remote_origin_cmd, working_dir: subproject_dir)
    puts "ERROR: unable to add remote for repo #{subproject_name}"
    return false
  end

  true
end

def fetch_ref(subproject_name, subproject_sha, subproject_dir)
  fetch_cmd = "git fetch origin #{subproject_sha}"
  unless run_cmd(fetch_cmd, working_dir: subproject_dir)
    unless fetch_and_checkout(subproject_name, subproject_sha, subproject_dir)
      # TODO: Add link here to a document at a later time about how to triage this on the mirror
      puts "ERROR: unable to fetch subproject #{subproject_name} sha #{subproject_sha}"
      puts "There was an issue verifying the target GitHub instance this job is running on contains the subproject!
Please verify the subproject exists on the target GitHub instance!"
      return false
    end
  end

  true
end

def fetch_and_checkout(subproject_name, subproject_sha, subproject_dir)
  puts "Trying to fetch and checkout #{subproject_name}"
  fetch_cmd = "git fetch origin"
  unless run_cmd(fetch_cmd, working_dir: subproject_dir)
    puts "ERROR: unable to fetch all refs for #{subproject_name}"
    return false
  end

  checkout_cmd = "git checkout #{subproject_sha}"
  unless run_cmd(checkout_cmd, working_dir: subproject_dir)
    puts "ERROR: unable to checkout ref #{subproject_sha} for project #{subproject_name}"
    return false
  end

  true
end

subprojects_failed = []

SUBPROJECT_REPOS.each do |subproject_name, subproject_version_file|
  subproject_sha = nil
  File.open(subproject_version_file) do |sha_file|
    sha_file.each_line do |line|
      # Some version files have comments, this ignores any lines that are comments
      if /^[^#].*$/.match?(line.strip)
        subproject_sha = line.strip
      end
    end
  end

  unless check_subproject_fetchable(subproject_name, subproject_sha)
    subprojects_failed << subproject_name
  end
end

if subprojects_failed.empty?
  puts "All subprojects are fetchable."
else
  puts "The following subprojects are not fetchable:"
  puts subprojects_failed.join("\n")
  exit 1
end
