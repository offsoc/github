# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"
require "optparse"
require "vexi/models/feature_flag"
require "json"
require "fileutils"

module Vexi
  # CLIOptions is the struct that represents the CLI options.
  class CLIOptions
    extend T::Sig
    extend T::Helpers

    sig { returns(String) }
    attr_accessor :name

    sig { returns(T::Boolean) }
    attr_accessor :boolean_gate

    sig { returns(Float) }
    attr_accessor :percentage_of_actors

    sig { returns(Float) }
    attr_accessor :percentage_of_calls

    sig { returns(T::Array[String]) }
    attr_accessor :custom_gates

    sig { returns(T::Array[String]) }
    attr_accessor :actors

    sig { returns(String) }
    attr_accessor :output_directory

    sig { void }
    def initialize
      @name = T.let("", String)
      @boolean_gate = T.let(false, T::Boolean)
      @output_directory = T.let("examples/generated/", String)
      @percentage_of_actors = T.let(0.0, Float)
      @percentage_of_calls = T.let(0.0, Float)
      @custom_gates = T.let([], T::Array[String])
      @actors = T.let([], T::Array[String])
    end
  end

  # CLI is the class that represents the CLI.
  class CLI < OptionParser
    extend T::Sig
    extend T::Helpers

    sig { params(args: T::Array[T.untyped]).void }
    def self.parse(args)
      options = CLIOptions.new
      feature_flags = []
      opt_parser = OptionParser.new do |opts|
        opts.banner = "Usage: vexi enable|disable [options]"

        opts.on("-f flag", "--flag=flag", "Feature flag") do |flag|
          feature_flags << flag
        end

        opts.on("-d directory", "--directory=directory",
                "Set the directory where you want to generate the file") do |dir|
          options.output_directory = dir
        end

        opts.on("--percentage_of_actors=percentage", Float,
                "Add percentage of actors") do |percentage|
          options.percentage_of_actors = percentage
        end

        opts.on("--percentage_of_calls=percentage", Float,
                "Add percentage of calls") do |percentage|
          options.percentage_of_calls = percentage
        end

        opts.on("--gate=gate_name",
                "Add custom gates") do |gate_name|
          options.custom_gates << gate_name
        end

        opts.on("--actor=actor_id",
                "Add actors using actor id format type:value") do |actor_id|
          options.actors << actor_id
        end

        opts.on("-h", "--help", "Prints this help") do
          puts opts
          exit
        end
      end

      FileUtils.mkdir_p options.output_directory

      action = opt_parser.parse!(args)

      options.boolean_gate = true if action[0].casecmp?("enable")
      enable_feature_flag(feature_flags, options) if action[0].casecmp?("enable")
      disable_feature_flag(feature_flags, options) if action[0].casecmp?("disable")
    end
    # rubocop:enable Metrics/MethodLength, Metrics/AbcSize, Metrics/BlockLength

    sig { params(feature_flags: T::Array[String], options: CLIOptions).void }
    def self.enable_feature_flag(feature_flags, options)
      feature_flags.each do |flag|
        ff = FeatureFlag.create_boolean_feature_flag(flag, true)
        update_feature_flag(ff, options)
        puts "enabling ff #{flag}"
      end
    end

    sig { params(feature_flags: T::Array[String], options: CLIOptions).void }
    def self.disable_feature_flag(feature_flags, options)
      feature_flags.each do |flag|
        ff = FeatureFlag.create_boolean_feature_flag(flag, false)
        update_feature_flag(ff, options)
        puts "disabling ff #{flag}"
      end
    end

    # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    sig { params(feature_flag: FeatureFlag, opts: CLIOptions).void }
    def self.update_feature_flag(feature_flag, opts)
      feature_flag.percentage_of_actors = opts.percentage_of_actors
      feature_flag.percentage_of_calls = opts.percentage_of_calls
      feature_flag.custom_gates = opts.custom_gates
      opts.actors.each do |actor_name|
        feature_flag.actors[actor_name] = true
      end

      feature_flag.is_default_segment_embedded = true

      is_partially_shipped = opts.percentage_of_actors.positive? || opts.percentage_of_calls.positive? ||
                             opts.custom_gates.any? || opts.actors.any?

      feature_flag.boolean_gate = false if is_partially_shipped && feature_flag.boolean_gate == true

      file_name = File.join(opts.output_directory, "#{feature_flag.name}.json")
      File.write(file_name, JSON.pretty_generate(FeatureFlag.to_h(feature_flag)))
    end
    # rubocop:enable Metrics/AbcSize, Metrics/MethodLength
  end
end
