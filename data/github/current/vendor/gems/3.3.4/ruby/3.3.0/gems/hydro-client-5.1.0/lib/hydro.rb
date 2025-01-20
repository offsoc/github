require "pathname"
require "google/protobuf"
require "google/protobuf/well_known_types"

require "hydro/client"
require "hydro/generated"
require "hydro/error"
require "hydro/publisher"
require "hydro/version"
require "hydro/message"
require "hydro/instrumenter"
require "hydro/sink"
require "hydro/site"
require "hydro/topic"

require "hydro/consumer"
require "hydro/processor"
require "hydro/executor"

require "hydro/source/message"
require "hydro/source/memory_source"
require "hydro/source/file_source"
require "hydro/source/kafka_source"

require "hydro/encoding/string_encoder"
require "hydro/encoding/protobuf_encoder"
require "hydro/encoding/protobuf/protobuf"

require "hydro/decoding/decoded_message"
require "hydro/decoding/protobuf_decoder"
require "hydro/log_streamer"

module Hydro

  def self.logger
    @logger ||= Logger.new(File::NULL)
  end

  def self.logger=(logger)
    @logger = logger
  end

  def self.consumer_logger
    @consumer_logger || logger
  end

  def self.consumer_logger=(logger)
    @consumer_logger = logger
  end

  def self.publisher_logger
    @publisher_logger || logger
  end

  def self.publisher_logger=(logger)
    @publisher_logger = logger
  end


  # Loads generated Hydro schemas. Temporarily alters the load path so that
  # `require` statements within generated protobufs work.
  #
  # directory - Required String|Pathname directory where Hydro schemas live.
  def self.load_schemas(directory)
    directory = Pathname.new(directory).expand_path
    $LOAD_PATH.unshift(directory)
    Dir[directory.join("**/*.rb")].each { |f| require f }
    $LOAD_PATH.shift
  end
end
