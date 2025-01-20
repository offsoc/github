# frozen_string_literal: true

require "json"
require "logger"
require "open3"
require "socket"
require "time"

def pretty_duration(sec)
  minutes = sec / 60
  seconds = sec % 60
  if minutes > 0
    "#{minutes} minutes, #{seconds} seconds"
  else
    "#{seconds} seconds"
  end
end

module Resqued
  ACTIVE_WORKER_REGEX = /(?<procline>aqueduct.*Processing job (?<job_id>.+) from (?<queue>\w+) since (?<started_at>.+): (?<job_name>\w+))/
  IDLE_WORKER_REGEX = /(?<procline>aqueduct.*Waiting for)/
  PS_PREFIX_REGEX = /(?<pid>\d+) (?<ppid>\d+) (?<elapsed_sec>\d+) /
  PS_ACTIVE_WORKER_REGEX = Regexp.new(PS_PREFIX_REGEX.source + ACTIVE_WORKER_REGEX.source)
  PS_IDLE_WORKER_REGEX = Regexp.new(PS_PREFIX_REGEX.source + IDLE_WORKER_REGEX.source)
  STATUS_TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%L%:z"

  def logger
    Resqued.logger
  end

  def self.logger
    @logger ||= Logger.new(STDERR, level: "INFO")
  end

  class WorkerInfo

    attr_accessor :pid, :job_id, :job_class, :elapsed_sec, :status, :active

    def initialize(pid:, job_id:, job_class:, elapsed_sec:, status:, active:)
      @pid = pid
      @job_id = job_id
      @job_class = job_class
      @status = status
      @elapsed_sec = elapsed_sec
      @active = active
    end

    def logger
      Resqued.logger
    end

    def is_job_class?(job_class_name)
      job_class == job_class_name
    end

    def running?(match_job_id: false)
      if File.exist? "/proc/#{pid}"
        procline = File.read "/proc/#{pid}/cmdline"

        # Don't accidentally kill some other process if it re-used the worker pid
        if matches = procline.match(ACTIVE_WORKER_REGEX)
          if match_job_id && matches[:job_id] != job_id
            logger.info "#{pid} is no longer executing job_id=#{job_id}, is running #{matches[:job_id]}"
            return false
          end
          return true
        else
          logger.info "#{pid} is not an active resqued worker: #{procline}"
        end
      else
        logger.info "#{pid} is no longer running"
      end
      false
    end

    def self.from_json(json)
      job_status = JSON.parse(json)
      WorkerInfo.new(
        pid: job_status["pid"],
        job_id: job_status["current_job"]["aqueduct_job_id"],
        job_class: job_status["current_job"]["job_class"],
        elapsed_sec: job_status["current_job"]["processing_elapsed_sec"],
        status: job_status,
        active: true,
      )
    end

    def to_json
      JSON.generate(status)
    end

    def active?
      active
    end

  end

  def get_worker_info(procline)
    worker_info = active_worker_info(procline, 1)

    if !worker_info
      worker_info = idle_worker_info(procline)
    end

    worker_info
  end

  def active_worker_info(procline, socket_timeout_sec)
    matches = procline.match(PS_ACTIVE_WORKER_REGEX)
    unless matches
      # process is not an active worker
      return nil
    end

    pid = matches[:pid].to_i
    worker_runtime_sec = matches[:elapsed_sec]
    # Default to whatever is in the procline
    job_id = matches[:job_id]
    job_name = matches[:job_name]
    queue = matches[:queue]
    job_started_at = Time.at(Integer(matches[:started_at]))
    job_elapsed_sec = Integer(Time.now - job_started_at)

    job_status = {
      "pid": pid,
      "runtime": worker_runtime_sec,
      "current_job": {
        "queue": queue,
        "aqueduct_job_id": job_id,
        "processing_started_at": job_started_at.strftime(STATUS_TIME_FORMAT),
        "job_class": job_name,
        "processing_elapsed_sec": job_elapsed_sec,
      }
    }

    # Use status server information if available - see lib/github/aqueduct/status_server.rb
    begin
      socket = UNIXSocket.new("/var/tmp/workers/#{pid}")
      socket.puts("current_job")
      if IO.select([socket], nil, nil, socket_timeout_sec)
        server_job_status = JSON.parse(socket.gets)

        if server_job_status["current_job"]
          job_status.merge! server_job_status
        end
      end
    rescue Errno::ENOENT
      job_status.merge!({ "error" => "Socket file not found for worker #{pid}" })
    end

    WorkerInfo.new(
      pid: pid,
      job_id: job_id,
      job_class: job_name,
      elapsed_sec: job_elapsed_sec,
      status: job_status,
      active: true,
    )
  end

  def idle_worker_info(procline)
    matches = procline.match(PS_IDLE_WORKER_REGEX)
    unless matches
      # process is not an idle worker
      return nil
    end

    pid = matches[:pid]
    worker_runtime_sec = matches[:elapsed_sec]

    job_status = {
      "pid": pid,
      "runtime": worker_runtime_sec,
      "current_job": {}
    }

    WorkerInfo.new(
      pid: pid,
      job_id: nil,
      job_class: nil,
      elapsed_sec: 0,
      status: job_status,
      active: false,
    )
  end

  def worker_status_by_pid(pid)
    cmd = "ps -p #{pid} -o 'pid:1,ppid:1,etimes:1,args:1' --no-headers"
    statuses(cmd: cmd, filter_by_active: false)
  end

  def worker_statuses
    cmd = "ps -eo 'pid:1,ppid:1,etimes:1,args:1' --no-headers"
    statuses(cmd: cmd, filter_by_active: true)
  end

  def statuses(cmd:, filter_by_active: false)
    workers = []
    stdout, stderr, status = Open3.capture3(cmd)
    unless status.success?
      logger.error "Could not fetch current job info from procline"
      logger.error "#{cmd} exited nonzero: #{status.exitstatus} \n with stderr: #{stderr}\n stdout:\n#{stdout}"
    end
    proclines = stdout.split("\n")

    proclines.each do |procline|
      worker_info = get_worker_info(procline)
      if !worker_info
        # Skip non-worker processes
        next
      end

      if filter_by_active && !worker_info.active?
        next
      end

      workers.append worker_info
    end

    workers
  end
end
