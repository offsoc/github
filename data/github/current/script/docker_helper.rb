# frozen_string_literal: true

require "open3"

module DockerHelper
  extend self

  TIMEOUT = 60
  MINIMUM_DOCKER_FREE_SPACE_GB = 12

  def ensure_docker_running
    return if docker_running?

    if ENV["CODESPACES"]
      # Call Codespaces' standard docker-in-docker start script as it does not
      # use `supervisorctl` to (re)start docker.
      system("sudo /usr/local/share/docker-init.sh")
      # This was chosen arbitrarily; feel free to bump as desired.
      sleep 2
      return if docker_running?
    end

    puts ""
    puts ""
    puts ""
    puts "Docker is required to complete bootstrapping for local"
    puts "development, but is not available."

    abort unless $stdin.tty?

    puts
    puts "Please start the Docker service before continuing, and ensure you"
    puts "wait a minute for it to become available before continuing."

    puts ""
    print "Press enter to continue..."
    $stdout.flush
    $stdin.gets

    return if docker_running?

    puts ""
    puts ""
    puts ""
    puts "Oops, looks like Docker still isn't working properly."
    abort
  end

  def docker_running?
    # system should work here but doesn't reliably with &>/dev/null so use Open3.capture3 instead.
    stdout, stderr, status = Open3.capture3("docker ps")
    status.success?
  end

  def ensure_docker_space_available
    stdout, stderr, _status = Open3.capture3("docker run --rm -i alpine df -P /")

    if stdout.nil? || stdout.empty?
      puts "Error running Docker to determine available disk space."
      puts "Docker error output:"
      puts stderr
      abort
    end

    table_headers, overlay_data = stdout.lines
    available_docker_space_kb = overlay_data.split[3].to_i
    available_docker_space_gb = available_docker_space_kb / 1024 / 1024

    if available_docker_space_gb < MINIMUM_DOCKER_FREE_SPACE_GB
      puts ""
      puts "Cowardly refusing to continue because the Docker VM"
      puts "does not have enough space to complete the bootstrap."
      puts ""
      puts "You can also try to decrease the space that Docker is using by running"
      puts "'docker system prune --all', which will remove all unused containers, networks, and images,"
      puts "and then by waiting a minute or two before bootstrapping again."
      abort
    end
  end
end

if __FILE__ == $0
  DockerHelper.ensure_docker_running
end
