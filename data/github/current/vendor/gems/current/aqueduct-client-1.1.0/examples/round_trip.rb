# A round trip through aqueduct. Need aqueduct running locally.
# Run bundle exec ruby -Ilib examples/round_trip.rb or ruby -Ilib examples/round_trip.rb

require "aqueduct"
require "aqueduct/worker"

Aqueduct.configure do |config|
  config.app = "test-app"
  config.url = "http://127.0.0.1:8085/twirp"
end

Aqueduct::Worker.configure do |config|
  config.fork_per_job = false
  config.handler = ->(job, status) {
    rtt = ((Time.now.to_f - job.payload.to_f) * 1000).round(2)
    puts "Processing job from #{job.queue}, RTT #{rtt} ms"
    sleep 2
  }
end

client = Aqueduct::Client.new

sender_pid = fork do
  loop do
    puts "Sending job"
    client.send_job(queue: "test-queue", payload: Time.now.to_f.to_s)

    begin
      sleep 5
    rescue Interrupt
      break
    end
  end
end

puts "Started sender with pid #{sender_pid}"

worker_pid = fork do
  Aqueduct::Worker::Worker.new(
    backend: Aqueduct::Worker::AqueductBackend.new(client: client),
    queues: ["test-queue"],
    logger: Logger.new(STDOUT),
  ).work
end

puts "Started worker with pid #{worker_pid}"

at_exit do
  Process.kill(:TERM, sender_pid)
  Process.wait(sender_pid)

  Process.kill(:QUIT, worker_pid)
  Process.wait(worker_pid)
end

sleep rescue Interrupt
