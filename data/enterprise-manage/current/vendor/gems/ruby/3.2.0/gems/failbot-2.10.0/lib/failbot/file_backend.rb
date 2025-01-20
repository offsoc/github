require 'json'

module Failbot
  class FileBackend
    def initialize(path)
      @path = path

      if path.to_s.empty?
        raise ArgumentError, "FAILBOT_BACKEND_FILE_PATH setting required."
      end
    end

    def report(data)
      File.open(@path, 'a') do |file|
        file.puts(data.to_json)
      end
    end

    def reports
      reports = []
      File.foreach(@path) do |line|
        reports << JSON.parse(line)
      end
      reports
    end

    def ping
      raise StandardError, "cannot write to #{@path}" unless File.writable?(@path)
    end
  end
end
