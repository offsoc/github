require "logger"
require "etc"

module ConsoleMonitor
  extend self

  attr_writer :logger

  def install
    log("# session started at #{console_session.hrt}")
    ::IRB::Context.prepend(ConsoleMonitor::Irb::Context) if defined?(::IRB)
    ::Pry.prepend(ConsoleMonitor::Pry) if defined?(::Pry)
    at_exit do
      log("# session stopped at #{console_session.hrt}")
    end unless @installed
    @installed = true
  end

  def console_session
    ConsoleAuth::Session
  end

  def shell_user
    @shell_user ||= Etc.getpwuid(Process.uid).name
  end

  def logger
    return @logger if @logger
    if ENV["KUBE_NODE_HOSTNAME"]
      @logger = moda_logger
    end
    @logger
  end

  def moda_logger
    return @moda_logger if @moda_logger

    # Kubernetes logs STDOUT of the originally started process
    # which is always started with PID 1
    # In order for our logs to be picked up from within an attached shell process
    # we have to write to the STDOUT of PID 1
    # which is File Descriptor 1 of Proc 1, found at /proc/1/fd/1
    io = IO.new(IO.sysopen("/proc/1/fd/1", "a"), "a")
    io.sync = true
    @moda_logger = Logger.new(io)
    @moda_logger.formatter = proc do |severity, datetime, progname, msg|
      {
        level: severity,
        logger_timestamp: datetime.to_s,
        app: progname
      }.merge(msg).to_json + "\n"
    end
    @moda_logger
  end

  def log(command)
    logger.info({
      command: command.strip,
      source: "gh_console",
      timestamp: Time.now.to_s,
      console_user: console_session.console_user || "not authenticated",
      shell_user: shell_user,
      console_session: console_session.session_id,
      splunk_index: "sec-prod-console"
    }) if logger && logger.respond_to?(:info)
  rescue StandardError
  end

  private

  module Irb
    module Context
      # The method signature prior to irb v1.7.4 contained
      # an optional though unused `exception: nil` kwarg.
      # https://github.com/ruby/irb/pull/617
      def evaluate(line, line_no, **kwargs)
        ConsoleMonitor.log(line)
        super
      end
    end
  end

  module Pry
    def eval(line, options = {})
      ConsoleMonitor.log(line)
      super
    end
  end
end
