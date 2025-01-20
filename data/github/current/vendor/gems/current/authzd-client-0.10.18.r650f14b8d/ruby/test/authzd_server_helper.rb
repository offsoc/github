# frozen_string_literal: true

require "socket"

TEST_HMAC_KEY = "authzdhmac"
SERVER_ADDR = "127.0.0.1:18082"
TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

def start_server(addr, bin_path: nil, out: "/dev/null", port: "18081")
  @env = { "HTTP_ADDR" => addr, "PORT" => port, "HMAC_KEY_0" => TEST_HMAC_KEY }
  bin_path ||= ENV.fetch("AUTHZD_BIN_PATH", "script/server --no-db-resolver")
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
      puts "Waiting authzd server at #{addr} to listen..."
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

def create_enumerator_client(twirp_address: TWIRP_ADDR, hmac_secret: TEST_HMAC_KEY)
  Authzd::Enumerator::Client.new(twirp_address) do |c|
    c.use :for_actor, with: [
      Authzd::Middleware::HmacSignature.new(instrumenter: Debug, key: hmac_secret)
    ]
    c.use :for_subject, with: [
      Authzd::Middleware::HmacSignature.new(instrumenter: Debug, key: hmac_secret)
    ]
  end
end

def for_subject_request(subject_id: 123456,
                        subject_type: "Repository",
                        actor_type: "User",
                        scope: "all",
                        relationship: "read")
  Authzd::Enumerator::ForSubjectRequest.new(
    subject_id: subject_id,
    subject_type: subject_type,
    actor_type: actor_type,
    options: Authzd::Enumerator::Options.new(relationship: relationship, scope: scope)
  )
end

def for_actor_request(actor_id: 123456,
                      actor_type: "User",
                      subject_type: "Repository",
                      scope: "all",
                      relationship: "read")
  Authzd::Enumerator::ForActorRequest.new(
    actor_id: actor_id,
    actor_type: actor_type,
    subject_type: subject_type,
    options: Authzd::Enumerator::Options.new(relationship: relationship, scope: scope)
  )
end

class Debug
  def self.instrument(name, payload = {})
    print("time: #{Time.now.strftime('%H:%M:%S.%L')}\nevent: #{name}\npayload: #{payload}\n\n")
    yield payload if block_given?
  end
end
