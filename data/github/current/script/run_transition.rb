#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "open3"
require "optparse"
require "logger"

class MultiLogger
  attr_reader :loggers

  def initialize(log_file)
    @loggers = []

    if ENV["RAILS_ENV"] != "test"
      @loggers.push(setup_logger(STDOUT))
    end
    @loggers.push(setup_logger(log_file))
  end

  def setup_logger(log_file)
    l = ::Logger.new(log_file)
    l.formatter = proc do |s, d, _p, m|
      time = d.strftime("%Y-%m-%d %H:%M:%S.%L")
      "time=#{time} severity=#{s} message=\"#{stripped_message(m)}\"\n"
    end
    l
  end

  def stripped_message(message)
    message.encode("UTF-8", "binary", invalid: :replace, undef: :replace, replace: "").strip
  end

  ::Logger::Severity.constants.each do |level|
    define_method(level.downcase) do |*args|
      @loggers.each { |logger| logger.send(level.downcase, *args) }
    end
  end
end

class TransitionRunner
  def self.parse_args(argv)
    args = {
      write_mode: T.let(false, T::Boolean),
      log_file: nil,
      start_id: nil,
      end_id: nil,
      divvy: T.let(false, T::Boolean),
    }

    opt_parser = OptionParser.new do |opts|
      opts.banner = "run-transition [options] [transition_file]"
      opts.separator ""
      opts.separator "Runs a github/github transition"
      opts.separator ""

      opts.on "-h", "--help", "Prints help" do
        puts opts
        exit
      end

      opts.on "--divvy", FalseClass, "Run transition with divvy instead of ruby" do |_d|
        args[:divvy] = true
      end

      opts.on "--end_id [ID]", Integer, "End ID for progressive rollout" do |e|
        args[:end_id] = e
      end

      opts.on "--start_id [ID]", Integer, "Start ID for progressive rollout" do |s|
        args[:start_id] = s
      end

      opts.on "-l", "--log-file [LOG FILE]", "Log file for transition apply output. Defaults to temp file named after transitions" do |l|
        args[:log_file] = l
      end

      opts.on "-w", "--write-mode", FalseClass, "Run transition in write mode" do |_d|
        args[:write_mode] = true
      end
    end

    opt_parser.parse!(argv = argv)
    args
  end

  def self.run!(args)
    parsed_args = TransitionRunner.parse_args(args)
    config = generate_config(args, parsed_args)
    runner = TransitionRunner.new(config[:executor_path], config[:log_file])
    runner.run_transition(config[:transition_file], parsed_args[:write_mode], parsed_args[:start_id], parsed_args[:end_id])
  end

  def self.generate_config(args, parsed_args)
    transition_file = args[0]
    if transition_file.nil?
      puts "Error: Please specify a path to a transition file."
      exit 1
    end

    if parsed_args[:log_file].nil?
      log_file = File.join("/tmp", "transition_apply_#{File.basename(transition_file, ".rb")}.log")
    else
      log_file = parsed_args[:log_file]
    end

    repo_root = File.expand_path(File.join(File.dirname(__FILE__), ".."))

    executor_path = File.join(repo_root, "bin/safe-ruby")
    if parsed_args[:divvy]
      executor_path = "divvy"
    end

    transition_full_path = File.join(repo_root, transition_file)
    unless File.exist?(transition_full_path)
      puts "Error: #{transition_full_path} does not exist"
      exit 1
    end

    unless ids_provided?(parsed_args[:start_id], parsed_args[:end_id])
      puts "Error: start_id and end_id are required together"
      exit 1
    end

    unless ids_compatible?(parsed_args[:start_id], parsed_args[:end_id])
      puts "Error: start_id and end_id values are incompatible"
      exit 1
    end

    {
      transition_file: transition_file,
      repo_root: repo_root,
      executor_path: executor_path,
    }
  end

  def self.ids_provided?(start_id, end_id)
    # Ensure start_id and end_id are both specified
    if start_id.nil? && !end_id.nil? || !start_id.nil? && end_id.nil?
      return false
    end

    true
  end

  def self.ids_compatible?(start_id, end_id)
    # Check if start_id and end_id are compatible and valid.
    # Otherwise pass nil through to run_transition so the arguments won't be added.
    unless start_id.nil? || end_id.nil?
      if start_id > end_id || start_id == end_id || start_id < 0 || end_id < 0
        return false
      end
    end

    true
  end

  def initialize(executor_path, log_file)
    @executor_path = executor_path
    @logger = MultiLogger.new(log_file)
  end

  def run_transition(transition_file, write_mode, start_id, end_id)
    cmd = create_transition_cmd(transition_file, write_mode, start_id, end_id)
    run_transition_command(cmd)
  end

  def create_transition_cmd(transition_file, write_mode, start_id, end_id)
    cmd = [
      @executor_path,
      transition_file,
      "--verbose",
    ]

    if write_mode
      cmd << "-w"
    end

    unless start_id.nil? && end_id.nil?
      cmd << "-start_id=#{start_id}"
      cmd << "-end_id=#{end_id}"
    end

    cmd
  end

  def run_transition_command(cmd)
    @logger.info("Running command \"#{cmd.join(" ")}\"")

    Open3.popen2e(*cmd) do |_stdin, stdout, thread|
      while thread.alive? do
        until (output = stdout.gets).nil?
          @logger.info(output)
        end
      end

      if status = thread.value
        return status.exitstatus
      else
        raise "Transition process did not exit cleanly"
      end
    end
  end
end
