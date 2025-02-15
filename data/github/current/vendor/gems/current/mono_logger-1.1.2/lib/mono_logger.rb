require 'mono_logger/version'

require 'logger'

#== MonoLogger
# A subclass of Ruby's stdlib Logger with all the mutex and logrotation stuff
# ripped out.
class MonoLogger < Logger

  #
  # === Synopsis
  #
  #   MonoLogger.new(STDOUT)
  #   MonoLogger.new(filename)
  #
  # === Args
  #
  # +logdev+::
  #   The log device.  This is a filename (String) or IO object (typically
  #   +STDOUT+, +STDERR+, or an open file).
  # +shift_age+::
  #   ignored in MonoLogger
  # +shift_size+::
  #   ignored in MonoLogger
  #
  # === Description
  #
  # Create an instance.
  #
  def initialize(logdev, shift_age=nil, shift_size=nil)
    super(nil)

    if logdev
      @logdev = LocklessLogDevice.new(logdev)
    end
  end


  class LocklessLogDevice < LogDevice

    def initialize(log = nil)
      @dev = @filename = @shift_age = @shift_size = nil
      if log.respond_to?(:write) and log.respond_to?(:close)
        @dev = log
      else
        @dev = open_logfile(log)
        @dev.sync = true
        @filename = log
      end
    end

    def write(message)
      @dev.write(message)
    rescue Exception => ignored
      warn("log writing failed. #{ignored}")
    end

    def close
      @dev.close rescue nil
    end

  private

    def open_logfile(filename)
      if (FileTest.exist?(filename))
        open(filename, (File::WRONLY | File::APPEND))
      else
        create_logfile(filename)
      end
    end

    def create_logfile(filename)
      logdev = open(filename, (File::WRONLY | File::APPEND | File::CREAT))
      logdev.sync = true
      add_log_header(logdev)
      logdev
    end

    def add_log_header(file)
      file.write(
        "# Logfile created on %s by %s\n" % [Time.now.to_s, Logger::ProgName]
      )
    end

  end


end

