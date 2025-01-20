module Octolytics
  # Decompress an incremental stream of GZip-compressed bytes from a producer,
  # sending decompressed chunks to another handler as they are formed.
  class GzippedStream
    MAX_CHUNK_SIZE=1024*512

    def initialize(decompressed_content_handler)
      @handler = decompressed_content_handler
    end

    def pipe
      if @pipe.nil?
        begin
          @pipe = IO.popen("gzip -d -c -f", "r+")
          @pipe.sync = true
        rescue Error::ENOENT => e
          raise "No gzip executable found!"
        end
      end
      @pipe
    end

    def call(chunk)
      pipe.write(chunk)
      while true do
        begin
          @handler.call(pipe.read_nonblock(MAX_CHUNK_SIZE))
        rescue IO::WaitReadable
          break
        end
      end
    end

    def close
      unless @pipe.nil?
        @pipe.close_write
        @handler.call(@pipe.read(MAX_CHUNK_SIZE)) until @pipe.eof?
        @pipe.close
      end
    end
  end
end
