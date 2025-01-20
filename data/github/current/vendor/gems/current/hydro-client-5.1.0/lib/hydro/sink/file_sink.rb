module Hydro
  class FileSink
    include Batching

    attr_reader :file

    # Build a Hydro::Sink that writes messages to a file.
    #
    # filename - the String or Pathname name of the target file.
    def initialize(filename:)
      @file = File.open(filename, "a")
    end

    def write(messages, options = {})
      if batching?
        add_to_batch(messages)
      else
        messages.each do |message|
          file.puts message.serialize
        end

        file.flush
      end

      Hydro::Sink::Result.success
    end

    def close
      file.close
    end
  end
end
