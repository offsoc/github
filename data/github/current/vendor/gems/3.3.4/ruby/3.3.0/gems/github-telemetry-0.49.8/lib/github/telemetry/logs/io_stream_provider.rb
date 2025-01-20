# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Provides a valid IO instance for use in creating a SemanticLogger::Appender::IO appender
      class IOStreamProvider
        PROC_1_FILE_DESCRIPTOR = "/proc/1/fd/1"

        attr_reader :stream

        def initialize
          @stream = build_io_stream
        end

        def build_io_stream
          stream = stream_for_tty
          stream.sync = true
          stream
        end

        def stream_for_tty
          # Since a codespace is technically a container, the logic to detect if we should send output to proc/1 would evaluate to true
          # But, in a codespace, we _do_ want to stream log output to the container process's stdout so that the user can see it
          # So, we use this codespace-specific workaround
          if ENV["CODESPACES"] == "true"
            $stdout
          else
            io_for_proc_one
          end
        end

        def io_for_proc_one
          if stream_to_proc_one
            new_io_for_proc_one
          else
            $stdout
          end
        end

        def stream_to_proc_one
          File.exist?(PROC_1_FILE_DESCRIPTOR) &&
          File.writable?(PROC_1_FILE_DESCRIPTOR) &&
            File.symlink?(PROC_1_FILE_DESCRIPTOR) &&
            File.readlink(PROC_1_FILE_DESCRIPTOR) != File::NULL
        end

        def new_io_for_proc_one
          IO.new(IO.sysopen(PROC_1_FILE_DESCRIPTOR, "w"), "w")
        end
      end
    end
  end
end
