#!/usr/bin/env safe-ruby
# typed: strict
# frozen_string_literal: true

# This script runs during a pre-push git hook. It is responsible for running all
# pre-push checks in parallel.  The checks are:
#
# Codeowners, Rubocop, Sorbet

require "open3"
require "optparse"
require "sorbet-runtime"
require "timeout"

extend T::Sig

class Check < T::Struct
  prop :output, String
  prop :success, T::Boolean
end

class CheckTimeout < StandardError; end

module Checks
  extend T::Sig

  sig { returns(T::Hash[String, Check]) }
  def self.output
    @output ||= T.let({}, T.nilable(T::Hash[String, Check]))
  end

  sig { returns(T::Array[Thread]) }
  def self.threads
    @threads ||= T.let([], T.nilable(T::Array[Thread]))
  end

  sig { params(name: String, command: String, blk: T.nilable(T.proc.params(arg0: String).returns(T::Boolean))).void }
  def self.run(name, command, &blk)
    thread = Thread.new do
      success_string = "finished"

      Open3.popen2e(command) do |_in, stdout_err, wait_thr|
        begin
          output, pid = "", wait_thr.pid
          Timeout::timeout(15, CheckTimeout) do
            output = stdout_err.read
          end

          begin
            Process.wait(pid)
          rescue Errno::ECHILD
          end

          status = T.cast(wait_thr.value, T.nilable(Process::Status))
          success = status.nil? || status.exitstatus.to_i.zero?
          success &&= yield(output) if block_given?
          Checks.output[name] = Check.new(output: output, success: success)
        rescue CheckTimeout
          # Upon timeout, assume success to avoid blocking developers from pushing
          Checks.output[name] = Check.new(output: "#{name} cancelled due to timeout.", success: true)
          success_string = "cancelled due to timeout."
        end
      end

      # Explicit newline to guarantee atomicity
      puts "#{name} #{success_string}\n"
    end

    threads << thread
  end

  sig { void }
  def self.join
    threads.each(&:join)
  end

  sig { returns(T::Hash[String, Check]) }
  def self.failed
    output.select { |_, check| !check.success }
  end
end

sig { void }
def serviceowners_check
  if ENV["SERVICEOWNERS_SKIP"] == "1" || ENV["SKIP_SERVICEOWNERS"] == "1"
    puts "x skipping serviceowners validation"
    return
  end

  puts "* serviceowners (set SERVICEOWNERS_SKIP=1 to skip)"
  Checks.run("serviceowners", "bin/safe-ruby script/git-hooks/serviceowners_pre_push") do |output|
    /Run script\/bootstrap to remedy this situation/.match?(output) ||
      /Serviceowners validation passed/.match?(output) ||
      output.empty?
  end
end

sig { void }
def rubocop_check
  if ENV["RUBOCOP_SKIP"] == "1" || ENV["SKIP_RUBOCOP"] == "1"
    puts "x skipping Rubocop validation"
    return
  end

  if ENV["RUBOCOP_NEW_ONLY"] == "1"
    puts "* rubocop for new files (unset RUBOCOP_NEW_ONLY to check all files, or set RUBOCOP_SKIP=1 to skip all Rubocop checks)."
  else
    puts "* rubocop for changed files (set RUBOCOP_NEW_ONLY=1 to check only new files, or set RUBOCOP_SKIP=1 to skip all Rubocop checks)."
  end

  Checks.run("rubocop", "bin/safe-ruby script/git-hooks/rubocop_pre_push.rb") do |output|
    /Run script\/bootstrap to remedy this situation/.match?(output) || output.empty?
  end
end

sig { void }
def sorbet_check
  if ENV["SORBET_SKIP"] == "1" || ENV["SKIP_SORBET"] == "1"
    puts "x skipping Sorbet validation"
    return
  end

  puts "* sorbet (set SORBET_SKIP=1 to skip)"

  Checks.run("sorbet", "SRB_SKIP_GEM_RBIS=1 bin/srb tc") do |output|
    /No errors!/.match?(output) || output.empty?
  end
end

puts "Starting checks in parallel:"
serviceowners_check
rubocop_check
sorbet_check
puts ""

Checks.join

puts ""

if Checks.output.all? { |_, check| check.success }
  puts "All checks succeeded!"
  exit 0
end

puts "The following checks failed:"
Checks.failed.each do |name, result|
  puts "#{name}:"
  puts result.output.lines.map { |line| "    #{line.chomp}" }
end
exit 1
