# frozen_string_literal: true

require "socket"
require "timeout"

SERVER_ADDR = "127.0.0.1:8991"
TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

def start_server(addr, bin_path: nil, out: "/dev/null", port: "8991")
  hmac = `go run ../script/generate-hmac.go`
  @env = {
    "HTTP_ADDR" => addr,
    "PORT" => port,
    "AZURE_COSMOS_ENDPOINT" => ENV["AZURE_COSMOS_ENDPOINT"],
    "Request-HMAC" => hmac,
  }
  bin_path ||= ENV.fetch("SERVER_BIN_PATH", "../bin/timeline-twirp")
  @pid = Process.spawn(@env, bin_path, [:out, :err] => out)
  await_connection(addr)
end

def stop_server
  return unless @pid

  Process.kill("TERM", @pid)
  Process.wait(@pid)
end

def await_connection(addr, timeout: 30)
  Timeout.timeout(timeout) do
    until listening_service?(addr)
      sleep 1
      puts "Waiting timeline server at #{addr} to listen..."
    end
  end
end

def listening_service?(addr, timeout: 5)
  host, port = addr.split(":", 2)
  Timeout.timeout(timeout) do
    socket = TCPSocket.new(host, port)
    socket&.close
    true
  rescue Errno::ECONNREFUSED
    false
  end
end
