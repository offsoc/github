#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

# This script calls the GitHub Api to update the required status checks for a branch on a repo.
# Usage:
#  update-required-status-checks.rb --help

require "json"
require "logger"
require "optparse"
require "yaml"

def parse_args(args)
  # defaults
  options = {
    :branch => "master",
    :nwo => "github/github",
    :execute => T.let(false, T::Boolean)
  }
  parser = OptionParser.new do |opts|
    opts.banner = "Usage: update-required-status-checks.rb [options]"

    opts.on("-b", "--branch BRANCH", "The branch to update branch protections") do |branch|
      options[:branch] = branch
    end

    opts.on("-r", "--repo REPO", "The repo name with owner (e.g. github/github)") do |nwo|
      options[:nwo] = nwo
    end

    opts.on("-p", "--config-file-path PATH", String, "[REQUIRED] The path to the config file with " +
            "the list of required jobs") do |config_file_path|
      options[:config_file_path] = config_file_path
    end

    opts.on("-t", "--token TOKEN", "[REQUIRED] The token used for authorization.") do |token|
      options[:token] = token
    end

    opts.on("-e", "--execute", "If set, the script will actually carry out the proposed required job changes on gh/gh") do
      options[:execute] = true
    end

    opts.on("-h", "--help", "Prints help message") do
      puts opts
      exit
    end
  end

  parser.parse!(args)

  def required_arg_check(arg, arg_name)
    if arg.nil?
      puts "\nERROR: #{arg_name} is a required argument."
      puts "Run 'update-required-status-checks.rb --help' for more information.\n\n"
      exit 1
    end
  end

  required_arg_check(options[:token], "--token")
  required_arg_check(options[:config_file_path], "--config-file-path")

  unless options[:nwo].include?("/")
    puts "\nERROR: --repo must be in the format of owner/repo (e.g. github/ci-hello-world).\n\n"
    puts parser.help
    exit 1
  end

  options
end

def current_required_status_checks(branch, nwo, token)
  response = `#{current_required_status_checks_cmd(branch, nwo, token)}`
  response_json = JSON.parse(response, symbolize_names: true)
  if response_json[:checks].nil?
    puts "ERROR: unable to get the current required status checks for the #{branch} branch on #{nwo}"
    puts response
    exit 1
  end

  response_json[:checks]
end

def parse_config_file(config_file_path)
  # Hack to symbolize names
  config = YAML.load_file(config_file_path).to_json
  JSON.parse(config, :symbolize_names => true)
end

def parse_config_file_helper(config)
  # Structure
  #   "checks": [
  #     {
  #       "context": "enterprise-lint-schema",
  #       "app_id": null
  #     }
  #   ]
  formatted_checks = []
  config[:required_checks].each do |_app_name, app|

    app_id = app[:app_id]
    checks = app[:checks]

    if checks
      checks.each do |check|
        if check[:required]
          formatted_checks << { :context => check[:name], :app_id => app_id }
        end
      end
    end
  end
  formatted_checks
end

def output_diff(branch, new_status_checks, nwo, token)
  curr_required_status_checks = current_required_status_checks(branch, nwo, token)

  checks_to_be_removed = curr_required_status_checks - new_status_checks
  checks_to_be_added = new_status_checks - curr_required_status_checks

  # Let's alphabetize the checks so they are easier to read.
  checks_to_be_removed.sort_by! { |check| check[:context] }
  checks_to_be_added.sort_by! { |check| check[:context] }

  # Ensure there are no surprises about the number of required checks before and after the proposed change
  output_check_count_helper(curr_required_status_checks, checks_to_be_added, checks_to_be_removed)

  if checks_to_be_added.empty? && checks_to_be_removed.empty?
    puts "No changes to the required status checks for the '#{branch}' branch on '#{nwo}'."
    puts "Exiting..."
    exit 0
  end

  update_msg = "\n  Updating required status checks for the '#{nwo}' repo on the '#{branch}' branch\n\n"
  puts "#" * update_msg.length
  puts update_msg
  puts "#" * update_msg.length

  output_diff_helper("add", checks_to_be_added)
  output_diff_helper("remove", checks_to_be_removed)

  puts "\nPress any key to continue...."
  gets
end

def current_required_status_checks_cmd(branch, nwo, token)
  "curl -Ls " +
  "-H \"Accept: application/vnd.github+json\" " +
  "-H \"Authorization: Bearer #{token}\" " +
  "-H \"X-GitHub-Api-Version: 2022-11-28\" " +
  "https://api.github.com/repos/#{nwo}/branches/#{branch}/protection/required_status_checks"
end

def get_new_status_checks_from_config_file(config_file_path)
  config = parse_config_file(config_file_path)
  parse_config_file_helper(config)
end

def output_diff_helper(action, checks)
  puts "\n"
  if checks.empty?
    puts "No checks to #{action}"
  else
    msg = "#{action.upcase} the following checks: "
    puts msg
    puts "-" * msg.length * 2
    puts checks
    puts "-" * msg.length * 2
  end
end

def output_check_count_helper(curr_required_status_checks, checks_to_be_added, checks_to_be_removed)
  puts "Calculating the number of required checks before and after the proposed change..."

  current_required_check_count = curr_required_status_checks.count
  proposed_required_check_count = curr_required_status_checks.count - checks_to_be_removed.count + checks_to_be_added.count

  puts ""
  puts "--------------------------------------"
  puts "Current required checks count: #{current_required_check_count}"
  puts "Check count after proposed changes: #{proposed_required_check_count}"
  puts "--------------------------------------"
  puts ""

  if current_required_check_count != proposed_required_check_count
    puts ""
    puts "*** WARNING: After running this update, the required job count will change! Is this expected? ***"
    puts "Type 'confirm' to proceed, or 'exit' to abort."
    puts ""

    answer = gets.chomp
    exit if answer != "confirm"
  end
end

def update_required_status_checks(branch, new_status_checks, nwo, token)
  request = create_request_body(new_status_checks)
  response = `#{update_required_status_checks_cmd(branch, nwo, request, token)}`
  puts response
end

def create_request_body(checks)
  # Example request body:
  #   {
  #     "strict": true,
  #     "checks": [
  #       {
  #         "context": "enterprise-lint-schema",
  #         "app_id": null
  #       }
  #     ]
  #   }
  { "strict": true, "checks": checks }.to_json
end

def update_required_status_checks_cmd(branch, nwo, request, token)
  "curl -Ls " +
  "-X PATCH " +
  "-H \"Accept: application/vnd.github+json\" " +
  "-H \"Authorization: Bearer #{token}\" " +
  "-H \"X-GitHub-Api-Version: 2022-11-28\" " +
  "https://api.github.com/repos/#{nwo}/branches/#{branch}/protection/required_status_checks " +
  "-d '#{request}'"
end

def main
  parsed_args = parse_args(ARGV)
  branch = parsed_args[:branch]
  config_file_path = parsed_args[:config_file_path]
  nwo = parsed_args[:nwo]
  token = parsed_args[:token]
  execute = parsed_args[:execute]

  new_status_checks = get_new_status_checks_from_config_file(config_file_path)
  output_diff(branch, new_status_checks, nwo, token)

  if execute
    puts "[Execute] Updating required jobs..."
    update_required_status_checks(branch, new_status_checks, nwo, token)
  else
    puts "[Noop] Not executing update on required jobs because --execute was not set"
  end
end

main
