# frozen_string_literal: true

require "socket"
require "timeout"

SERVER_ADDR = "127.0.0.1:8989"
TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

def start_server(addr, bin_path: nil, out: "/dev/null", port: "8989")
  @env = { 
    "HTTP_ADDR" => addr,
    "PORT" => port,
    "GRAPH_COSMOS_HOST" => ENV["GRAPH_COSMOS_HOST"],
    "GRAPH_COSMOS_KEY" => ENV["GRAPH_COSMOS_KEY"],
    "GRAPH_COSMOS_DATABASE" => ENV["GRAPH_COSMOS_DATABASE"],
    "GRAPH_COSMOS_COLLECTION" => ENV["GRAPH_COSMOS_COLLECTION"]
  }
  bin_path ||= ENV.fetch("SERVER_BIN_PATH", "bin/issues-graph-twirp")
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
      puts "Waiting issues-graph server at #{addr} to listen..."
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