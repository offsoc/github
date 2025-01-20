# typed: true
# frozen_string_literal: true

# TODO: Replace this with a standard logging mechanism (for GitHub or Ruby).

module DX
  SUPPORTED_LOG_LEVELS = [:debug, :info, :warn, :error, :fatal]
  EXTENDED_LOG_LEVELS = SUPPORTED_LOG_LEVELS + [:none]
  LOG_LEVEL_PREFIXES = { debug: "DEBUG:", info: "INFO: ", warn: "WARN: ", error: "ERROR:", fatal: "FATAL:" }
  @@log_level = :none

  def self.set_log_level(level)
    verify_log_level(level, EXTENDED_LOG_LEVELS)
    @@log_level = level
  end

  def self.log_priority(level)
    EXTENDED_LOG_LEVELS.index(level)
  end

  def self.log(level, message)
    verify_log_level(level, SUPPORTED_LOG_LEVELS)
    if log_priority(level) >= log_priority(@@log_level)
      puts "#{LOG_LEVEL_PREFIXES[level]} #{message}"
    end
  end

  def self.verify_log_level(level, log_levels)
    raise RuntimeError, "Invalid log level: #{level}" unless log_levels.include?(level)
  end

  def self.log_elapsed_time(level, step)
    DX::log level, "#{step}..."
    start_time = Time.now
    result = yield
    DX::log level, "#{step} finished in #{(Time.now - start_time).round(1)} seconds."
    result
  end

end
