module Hydro
  class MemorySink
    include Enumerable
    include Batching

    attr_reader :messages

    def initialize
      @messages = []
      @errors = []
      @result, @sleeps, @closed = nil, nil, nil
    end

    def write(messages, options = {})
      if error = @errors.shift
        raise error
      end

      if @sleeps
        sleep @sleeps
      end

      if @result
        return @result
      end

      if batching?
        add_to_batch(messages)
      else
        @messages += messages
      end

      if forward_to
        return forward_to.write(messages)
      end

      Hydro::Sink::Result.success
    end

    def each(&block)
      @messages.each(&block)
    end

    def close
      @closed = true
    end

    def closed?
      !!@closed
    end

    def reset
      messages.clear
    end

    def force_result(result)
      @result = result
    end

    def raises(error)
      @errors << error
    end

    def sleeps(n)
      @sleeps = n
    end

    private

    attr_reader :forward_to
  end
end
