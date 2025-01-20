require 'json'

module Failbot
  class ConsoleBackend
    def report(data)
      $stderr.puts data.to_json
    end
  end
end
