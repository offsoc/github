# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/builder"
require "vexi/client"
require "vexi/configuration"
require "vexi/services/feature_flag_service"
require "vexi/services/segment_service"

# Public: The main Vexi module for performing feature flag enabled checks.
module Vexi
  # Public: The main Vexi class for performing feature flag enabled checks.
  extend T::Sig


  # Public: This method can be used to simply configure and create a new vexi instance
  #         The returned client is not storead in a thread-safe way so it is generally
  #         recommended to use `configure()` followed by `instance()` instead.
  sig { params(blk: T.proc.params(config: Builder).void).returns(Client) }
  def self.build(&blk)
    config = Configuration.new
    builder = Builder.new(config)

    blk.call(builder)

    config.create_instance
  end

  # Public: Configure Vexi
  sig { params(blk: T.proc.params(config: Builder).void).void }
  def self.configure(&blk)
    # Reset config and before configuring the client again
    @configuration = Configuration.new
    builder = Builder.new(configuration)

    blk.call(builder)

    Thread.current[:vexi_instance] = configuration.create_instance
  end

  # Public: Get the vexi instance for the currently running thread, requires the Vexi to be configured first
  sig { returns(Vexi::Client) }
  def self.instance
    Thread.current[:vexi_instance] ||= configuration.create_instance
  end

  sig { returns(::Vexi::Configuration) }
  def self.configuration
    @configuration ||= T.let(Configuration.new, T.nilable(::Vexi::Configuration))
  end
end
