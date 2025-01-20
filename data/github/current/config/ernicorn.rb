# frozen_string_literal: true

# Ernicorn configuration file. Loaded by the RPC servers on fs machines.
#
# Supports all Unicorn config options:
#
#    http://unicorn.bogomips.org/Unicorn/Configurator.html
#
# Example unicorn config files:
#
#   http://unicorn.bogomips.org/examples/unicorn.conf.rb
#   http://unicorn.bogomips.org/examples/unicorn.conf.minimal.rb

require File.expand_path("../../config/basic", __FILE__)
require_relative "initializers/bert_protocol_version"
require "github/config/stats"
require "socket"

env = ENV["RAILS_ENV"] || "development"

if ENV["ERNICORN_SOCKET_PATH"]
  # The socket path can be set on the command line (--listen
  # /tmp/ernicorn.sock) but the increased backlog cannot. Using a socket path
  # is only required for rover-based process control.
  listen ENV["ERNICORN_SOCKET_PATH"], backlog: 2048
end

ernicorn_port = ENV["GITHUB_ERNICORN_PORT"]
if ernicorn_port
  listen "127.0.0.1:#{ernicorn_port}"
end

if env == "production"
  git_infra_utils_path = "/data/gitrpcd/current/bin"
else
  git_infra_utils_path = "#{GitHub::AppEnvironment.root}/vendor/gitrpcd/build"
end
ENV["PATH"] = "#{git_infra_utils_path}:#{ENV['PATH']}"

# expose gitrpc server module
require "gitrpc"
require "gitrpc/experiment"

GitHub.component = :ernicorn
case env
when "production"
  GitRPC.gitmon_enabled = 20 # percent of calls to track
  unless ENV["GITHUB_CONFIG_ROLE"]
    GitHub.role = GitHub.role_from_host
  end
else
  GitRPC.gitmon_enabled = true
  GitHub.role = :development
end

# Configure the hooks template symlink location.
GitRPC.hooks_template = "#{GitHub.repository_template}/hooks"

GitRPC.repository_root = File.realdirpath(GitHub.repository_root)

module GitRPC::Protocol::BERTRPCServer
  # Called by Ernie.dispatch whenever a method in this module is invoked.
  def self.dispatching(request)
    if request[0] == :send_message
      cmd, path, options, message, args = request
      #printf "%f gitrpc,rpc %s %s\n", time, message, path
      Ernicorn.procline("gitrpc:#{message}(#{File.basename path, '.git'}) start:#{Time.now.to_i}")
    end
  end
end
Ernicorn.expose(:gitrpc, GitRPC::Protocol::BERTRPCServer)

module ::Ernicorn
  def self.around_action
    yield
  ensure
    if ::GitHub::Memory.memrss > 250 * 1024 * 1024
      GC.start
    end
  end
end

# enable verbose call logging in all environments except production for now.
Ernicorn.loglevel 1 if env != "production"

# limit mmap memory
require "rugged"
Rugged::Settings["mwindow_size"] = 32 * 1024 * 1024
Rugged::Settings["mwindow_mapped_limit"] = 64 * 1024 * 1024

# server options
working_directory(ENV["ERNICORN_ROOT"] || File.expand_path("../..", __FILE__))
preload_app true

# This timeout should always be larger than the largest GitRPC client timeout
# to ensure that GitRPC clients can handle timeouting commands and raise the correct exception.
#
# Set to the maximum gitrpc call timeout, namely the nw_gc/nw_repack called by
# NetworkMaintenanceJob, plus 60 seconds grace period
# (see commit 1456c200ce9b4)
timeout(3 * 60 * 60 + 60)

# make sure the tmp/pids directory exists
require "fileutils"
FileUtils.mkdir_p "tmp/pids"

log_destination = ENV.fetch("GH_LOG_DESTINATION", "file")
# reopen stderr/stdout on log file except in dev and test environments
if !%w[development test].include?(env) && log_destination == "file"
  stdout_path "log/ernicorn.log"
  stderr_path "log/ernicorn.log"
end

if GitHub.enterprise? && env == "production"
  worker_processes((ENV["ENTERPRISE_ERNICORN_WORKERS"] || 2).to_i)
elsif GitHub.employee_unicorn?
  worker_processes 6
elsif env == "production"
  worker_processes ENV.fetch("ERNICORN_WORKERS", 2 * Etc.nprocessors).to_i
elsif env == "test"
  worker_processes 3
else
  worker_processes 2
end

if env == "production" && !GitHub.enterprise?
  begin
    GitRPC.host_metadata = GitHub.read_metadata
    GitRPC.extra_native_env = {
      "GITHUB_CONFIG_ROLE" => GitHub.role.to_s,
      "GITHUB_CONFIG_COMPONENT" => "gitrpc",
    }
  rescue Errno::ENOENT, GitHub::JSON::ParseError, NoMethodError, KeyError => e
    # nbd?
  end
end

# rubocop:disable Lint/UnusedBlockArgument

# hook into new child immediately after forking
after_fork  do |server, worker|
end

# hook into master immediately before re-exec'ing itself
before_exec do |server|
  ENV.delete("RUBYLIB")
  ENV["GIT_SOCKSTAT_NO_SCHEDULING"] = "1"

  # load gpanel config if it exists
  GitHub.reload_gpanel_config

  # enterprise uses environment variables to inject customer configuration. When
  # the ernicorn reloads due to a customer update, it needs to slurp up the latest
  # environment variables from the shared/env.d/*.sh files.
  if GitHub.enterprise? && ENV.key?("ENTERPRISE_APP_INSTANCE")
    lines = %x{. #{ENV["ENTERPRISE_APP_INSTANCE"]}/.app-config/production.sh && env}.split("\n")
    enterprise_variables = lines.grep(/\A(ENTERPRISE|GH_|GITHUB)/).map { |l| l.split("=", 2) }

    enterprise_variables.each do |(key, value)|
      ENV[key] = value
    end

    %w(RUBYOPT GEM_HOME GEM_PATH).each do |opt|
      ENV.delete(opt)
    end
  end
  # rubocop:enable Lint/UnusedBlockArgument
end
