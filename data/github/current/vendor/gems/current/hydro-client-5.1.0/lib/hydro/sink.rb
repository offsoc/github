require "hydro/sink/result"
require "hydro/sink/batching"
require "hydro/sink/memory_sink"
require "hydro/sink/log_sink"
require "hydro/sink/noop_sink"
require "hydro/sink/kafka_sink"
require "hydro/sink/tee"
require "hydro/sink/file_sink"
require "hydro/sink/gateway_sink"
require "hydro/sink/async_sink"

module Hydro
  module Sink
    def self.tee(primary, secondary)
      Tee.new(primary, secondary)
    end
  end
end
