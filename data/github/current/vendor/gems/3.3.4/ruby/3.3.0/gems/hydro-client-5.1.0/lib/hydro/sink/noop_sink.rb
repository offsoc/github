module Hydro
  class NoopSink
    # Triggered on sink write
    WRITE_EVENT = "write.noop_sink.hydro"

    def batchable?
      false
    end

    def write(messages, options = {})
      Hydro.instrumenter.instrument(WRITE_EVENT, messages: messages)
      Hydro::Sink::Result.success
    end

    def close
      # no op
    end
  end
end
