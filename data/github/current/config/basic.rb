# frozen_string_literal: true

# Lightweight environment configuration.
#
# This file is useful when you want to load a small portion of the whole
# github environment for daemons that want to keep their resident memory
# usage low or commands that need to boot fast.
#
# After requiring this file, the following is available:
#
# - RAILS_ENV constant is set.
# - Basic load path is configured so libraries may be required.
# - Rails.environment? predicate methods are available.
# - Rails.logger is set to a valid Logger object.
#
# This file should be required using its absolute canonical path without any
# relative path parts. The easiest way to accomplish this is to use expand_path
# as follows:
#
#     require File.expand_path('../../config/basic', __FILE__)

# Bail out early unless we're using safe-ruby
unless ENV["HAS_USED_SCRIPT_ENVIRONMENT"]
  abort "Error: The GitHub app requires using safe-ruby\n" \
        "Error: Try `#{$0.sub(/script\//, "bin/")}`"
end

config_basic_start = Process.clock_gettime(Process::CLOCK_MONOTONIC)

# Enable GC stats tracking first thing if the interpreter supports it
GC.enable_stats if GC.respond_to?(:enable_stats)

if ENV["TRACE_ALLOCATIONS"]
  require "objspace"
  ObjectSpace.trace_object_allocations_start
end

if ENV["GC_PROFILE"]
  GC::Profiler.enable
end

# Disable all Gem deprecation warnings.
if defined?(Gem::Deprecate) && Gem::Deprecate.respond_to?(:skip=)
  Gem::Deprecate.skip = true
end

# Calculate gem dir
vendor_gems = "vendor/gems/#{RUBY_VERSION}"

# We'll need this to get realpaths
require "pathname"

ROOT = Pathname.new(File.expand_path("../..", __FILE__)).realpath.to_s unless defined?(ROOT)

bundler_standalone_setup = "#{ROOT}/#{vendor_gems}/bundler/setup.rb"

# Determine ENV["RAILS_ROOT"] from this file's location. We take the realpath
# to remove all symlinks and other non-canonical path components.
ENV["RAILS_ROOT"] ||= ROOT

running_tests = $PROGRAM_NAME == Pathname(ROOT).join("script/rails").to_s && (ARGV.first == "test" || ARGV.first == "t" || ARGV.first&.match(/^test[:_]/))

# Determine RAILS_ENV from the environment or current hostname
ENV["RAILS_ENV"] ||=
  if ENV["RAILS_ROOT"].start_with? "/data/github/"
    "production"
  elsif running_tests
    "test"
  else
    "development"
  end

rails_root = Pathname.new(ENV["RAILS_ROOT"])

# Mimic enough of Rails so you can check the current Rails environment and
# have a default logger.
#
# GitHub::AppEnvironment has been added to replace this module. We unfortunately cannot safely remove this at this time.
# See the following comments/concerns
#   - https://github.com/github/github/pull/261233#pullrequestreview-1328508980
#   - https://github.com/github/github/pull/261233#discussion_r1116429438
if !defined?(Rails)
  module Rails
    # Replicate ActiveSupport::StringInquirer
    @env = Class.new(String) do
      def method_missing(method_name, *)
        method_name.to_s =~ /(.+)\?/ ? $1 == self : super
      end
    end.new(ENV["RAILS_ENV"])

    @root = Pathname.new(ENV["RAILS_ROOT"])

    class << self
      attr_reader :env, :root
    end

    def self.logger
      return ::LOGGER if defined?(::LOGGER)
      @null_logger ||=
        begin
          require "logger"
          Logger.new(nil)
        end
    end
  end
end

# load gpanel config if it exists
gpanel_config = "#{rails_root}/.app-config/#{ENV["RAILS_ENV"]}.rb"
load gpanel_config if File.file? gpanel_config

# Set ENTERPRISE environment variable when runtime mode file exists in
# development or test. This means all commands abide by the currently
# selected, persistent runtime mode set by script/setup.
current_runtime_file = "#{rails_root}/tmp/runtime/current"
if %w(development test).include?(ENV["RAILS_ENV"]) && File.exist?(current_runtime_file)
  current_runtime = File.read(current_runtime_file).chomp
  if current_runtime == "enterprise"
    ENV["ENTERPRISE"] = "1"
  else
    ENV["ENTERPRISE"] = ENV["E"] = ENV["FI"] = nil
  end
elsif ENV["RAILS_ENV"] == "production" && !ENV["ENTERPRISE"].to_s.empty?
  current_runtime = "enterprise"
else
  current_runtime = "dotcom"
  ENV["ENTERPRISE"] = ENV["E"] = ENV["FI"] = nil
end

unless ENV["BOOTSTRAPPING"]
  if %w(staging production).include?(ENV["RAILS_ENV"])
    # Verify the environment has been bootstrapped by checking that the
    # bundler standalone setup file has been generated.
    if !File.exist?(bundler_standalone_setup)
      warn "WARN The #{current_runtime} gem environment is out-of-date or has yet to be bootstrapped."
      warn "     File not found: #{bundler_standalone_setup}"
      warn "     Run script/bootstrap to remedy this situation."
      fail "gem environment not configured in #{ENV["RAILS_ENV"]}, missing bundler standalone setup"
    end
  else
    if ENV["CIBUILD_BOOTSTRAP_COMPLETE"] && !File.exist?(bundler_standalone_setup)
      warn "WARN The #{current_runtime} has no bundler standalone setup file."
      warn "     But CIBUILD_BOOTSTRAP_COMPLETE is already set, refusing to autobootstrap."
      warn "Debugging output follows:"
      warn `pwd`
      warn `cat .git/HEAD`
      warn `git rev-parse HEAD`
      warn `git status`
      fail "gem environment not configured in #{ENV["RAILS_ENV"]} despite running in CI"
    end

    # Run a more exhaustive bootstrap check in non-production environments by making
    # sure the Gemfile matches the Ruby+Gemfile.lock checksum.
    #
    # Verify the environment has been bootstrapped by checking that the
    # bundler standalone setup file has been generated.
    if !File.exist?(bundler_standalone_setup)
      warn "WARN The #{current_runtime} gem environment is out-of-date or has yet to be bootstrapped."
      warn "     File not found: #{bundler_standalone_setup}"
      if ENV["GITHUB_NO_AUTO_BOOTSTRAP"]
        fail "     Run script/bootstrap to remedy this situation!"
      else
        warn "     Running script/bootstrap to remedy this situation..."
        system "#{rails_root}/script/bootstrap", exception: true
      end

      if !File.exist?(bundler_standalone_setup)
        warn "WARN The #{current_runtime} gem environment is STILL out-of-date."
        warn "     File still not found: #{bundler_standalone_setup}"
        warn "     Please contact your network administrator."
        fail "gem environment not configured in #{ENV["RAILS_ENV"]}, still missing bundler standalone setup"
      end
    end

    if ENV["GITHUB_SKIP_BOOTSTRAP_CACHE_CHECK"]
      warn "Bootstrap cache checking has been disabled via `GITHUB_SKIP_BOOTSTRAP_CACHE_CHECK`, things may break!"
    else
      require_relative "../lib/bootstrap_cache"
      cache = BootstrapCache.new(rails_root)
      if cache.ruby_files_changed?
        if ENV["CIBUILD_BOOTSTRAP_COMPLETE"]
          warn "WARN The #{current_runtime} gem environment cache is out of date."
          warn "     But CIBUILD_BOOTSTRAP_COMPLETE is already set, refusing to autobootstrap."
          warn "Debugging output follows:"
          warn `pwd`
          warn `cat .git/HEAD`
          warn `git rev-parse HEAD`
          warn `git status`
          fail "gem environment not configured in #{ENV["RAILS_ENV"]} despite running in CI"
        end

        warn "WARN The #{current_runtime} gem environment is out-of-date or has yet to be bootstrapped."
        if ENV["GITHUB_NO_AUTO_BOOTSTRAP"]
          fail "     Run script/bootstrap to remedy this situation!"
        else
          warn "     Running script/bootstrap to remedy this situation..."
          system "#{rails_root}/script/bootstrap", exception: true
        end

        # The cache may still not end up in the state we were expecting, ask the user to retry
        if cache.ruby_files_changed?
          if cache.ruby_version.changed?
            warn "WARN It looks like ruby versions changed."
            fail "Re-run the command to pick up the new version. <3"
          end
          warn "WARN The #{current_runtime} gem environment is STILL out-of-date."
          warn "     Please re-run the command or contact your network administrator."
          fail "gem environment not configured in #{ENV["RAILS_ENV"]}, checksums on files '#{cache.changes.map(&:filenames).flatten}' don't match."
        end
      end
    end

    # Verify that the git build is up to date, bootstrap if not
    if ENV["RAILS_ENV"] == "development" && !ENV["SKIP_GIT_BUILD"]
      pinned_git_version  = File.read("#{rails_root}/config/git-version").
        split("\n").find { |line| line[0] != "#" }
      current_git_version = File.read("#{rails_root}/vendor/git-core/version").
        strip rescue nil
      if current_git_version != pinned_git_version
        warn "WARN The git build is out-of-date.  Current: #{current_git_version}, pinned: #{pinned_git_version}."
        if ENV["GITHUB_NO_AUTO_BOOTSTRAP"]
          fail "     Run script/build-git to remedy this situation!"
        else
          warn "     Running script/build-git to remedy this situation..."
          system("#{rails_root}/script/build-git") || fail("git build failed")
        end
      end
    end

    # If script/server is run with LOCAL_PRIMER=1 flag,
    # npm link the primer packages on the developer's computer
    if ENV["RAILS_ENV"] == "development"
      primerized = File.exist?("#{rails_root}/node_modules/primer") && File.symlink?("#{rails_root}/node_modules/primer")
      want_local_primer = ENV["LOCAL_PRIMER"] == "1"
      if primerized
        warn "-" * 80
        warn " Development primer is linked to the local primer repository found here"
        warn " #{File.expand_path("../primer", rails_root)}"
        warn "-" * 80
        unless want_local_primer
          warn "Turning off linked primer"
          system("#{rails_root}/script/primerize off")
        end
      elsif want_local_primer
        warn "Linking primer on your machine to the GitHub development environment."
        warn " #{File.expand_path("../primer", rails_root)}"
        system("#{rails_root}/script/primerize on")
      end
    end
  end
end

# tapioca and packwerk need bundler available at runtime. To ensure we
# use the gem installed version of bundler instead of whatever version ships
# with Ruby, we manually add the gem's lib to the load path. This must be done
# before modifying Gem.paths below, since bundler is not installed to
# vendor/gems.
$:.unshift(*Gem::Specification.find_by_name("bundler").full_require_paths) if $PROGRAM_NAME.match?(/tapioca|packwerk/)

# Disallow use of system gems by default in all environments. This ensures the
# gem environment is totally isolated to only stuff specified in the Gemfile.
require "rbconfig"
ENV["GEM_PATH"] = "#{rails_root}/#{vendor_gems}/ruby/#{RbConfig::CONFIG['ruby_version']}"
ENV["GEM_HOME"] = "#{rails_root}/#{vendor_gems}/ruby/#{RbConfig::CONFIG['ruby_version']}"

Gem.paths = ENV

# put RAILS_ROOT/bin on PATH
binpath = "#{rails_root}/bin"
ENV["PATH"] = "#{binpath}:#{ENV['PATH']}" if !ENV["PATH"].include?(binpath)

# For dev and test, we need the `git-nw` executables (part of
# `gitrpcd`) in PATH:
if ENV["RAILS_ENV"] != "production"
  gitrpcd_path = "#{rails_root}/vendor/gitrpcd/build"
  if !ENV["PATH"].split(":").include?(gitrpcd_path)
    ENV["PATH"] = "#{gitrpcd_path}:#{ENV['PATH']}"
  end
end

# Set up the load path using bundler's standalone setup file
require bundler_standalone_setup
$LOAD_PATH.unshift("#{ROOT}/lib") unless $LOAD_PATH.include?("#{ROOT}/lib")

module Kernel
  # Don't allow gem activations, we do this manually
  def gem(*)
  end
  private :gem
end

# Disable when bootstrapping as directories might not be in their final state yet.
# This is particularly important for our legacy git-based deploys.
# See https://github.com/github/developer-flow/issues/19
#
# The GH_SHELL check is a terrible hack since we run things for Hubot as the non `git`
# user and that breaks with bootsnap otherwise. See also
# https://github.com/github/git-systems/issues/458. This needs to be cleaned up
# once those chatops are moved away from using shell and needing github/github
# on Hubot nodes.
unless ENV["BOOTSTRAPPING"] || ENV["GH_SHELL"]
  require "bootsnap"

  Bootsnap.setup(
    cache_dir:            "#{rails_root}/tmp/cache",
    development_mode:     ENV["RAILS_ENV"] == "development" && !ENV["PRELOAD"] && !ENV["FASTDEV"],
    load_path_cache:      true,
    compile_cache_iseq:   true,
    compile_cache_yaml:   true,
    readonly:             !ENV["BOOTSNAP_PRECOMPILE"] && ENV["RAILS_ENV"] != "development",
  )
end

# Ensure to use OpenSSL digests for any digest operation.
# See https://github.com/ruby/openssl/pull/377 as well.
require "digest"
require "openssl"
module Digest
  rename_builtin = proc { |name|
    begin
      default = const_get(name)
    rescue LoadError
    else
      const_set(:"#{name}_DEFAULT", default)
      remove_const(name)
    end
  }

  # OpenSSL::Digest.new("RIPEMD160")
  # Mark this as allowed since we do want to replace this regardless,
  # since the OpenSSL version would have error handling in FIPS mode.
  RMD160 = OpenSSL::Digest::RIPEMD160 if rename_builtin.call(:RMD160) # rubocop:disable GitHub/InsecureHashAlgorithm

  # OpenSSL::Digest.new("MD5")
  # Mark this as allowed since we do want to replace this regardless,
  # since the OpenSSL version would have error handling in FIPS mode.
  MD5 = OpenSSL::Digest::MD5 if rename_builtin.call(:MD5) # rubocop:disable GitHub/InsecureHashAlgorithm

  # OpenSSL::Digest.new("SHA1")
  # Mark this as allowed since we do want to replace this with OpenSSL
  # anyway for legacy cases.
  SHA1 = OpenSSL::Digest::SHA1 if rename_builtin.call(:SHA1) # rubocop:disable GitHub/InsecureHashAlgorithm

  # OpenSSL::Digest.new("SHA256")
  SHA256 = OpenSSL::Digest::SHA256 if rename_builtin.call(:SHA256)

  # OpenSSL::Digest.new("SHA384")
  SHA384 = OpenSSL::Digest::SHA384 if rename_builtin.call(:SHA384)

  # OpenSSL::Digest.new("SHA512")
  SHA512 = OpenSSL::Digest::SHA512 if rename_builtin.call(:SHA512)
end

# Enable failbot reporting of unhandled exceptions.
require "github"
require "github/config/failbot"

require "github/boot_metrics"
GitHub::BootMetrics.initial_boot_time = config_basic_start

# Enable tracing.
require "rbtrace"

# TODO: move this to something like GitHub.rails_version
require "rails/version"

GitHub::BootMetrics.record_state("basic")
