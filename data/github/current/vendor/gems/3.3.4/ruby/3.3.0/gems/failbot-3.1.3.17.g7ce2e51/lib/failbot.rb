require 'yaml'
require 'digest/sha2'
require 'logger'
require 'socket'
require "time"
require "timeout"
require "date"
require "uri"
require 'resilient'

require 'failbot/version'
require "failbot/sensitive_data_scrubber"
require "failbot/exception_format/haystack"
require "failbot/exception_format/structured"
require "failbot/backtrace_parser"
require "failbot/errors"
require "failbot/backtrace/trimmer"
require "failbot/backtrace/frame"
require "failbot/config"

# Failbot asynchronously takes exceptions and reports them to the
# exception logger du jour. Keeps the main app from failing or lagging if
# the exception logger service is down or slow.
module Failbot
  autoload :ConsoleBackend, 'failbot/console_backend'
  autoload :FileBackend,    'failbot/file_backend'
  autoload :HTTPBackend,    'failbot/http_backend'
  autoload :MemoryBackend,  'failbot/memory_backend'
  autoload :WaiterBackend,  'failbot/waiter_backend'

  autoload :ThreadLocalVariable, 'failbot/thread_local_variable'

  # Public: Set an instrumenter to be called when exceptions are reported.
  #
  #   class CustomInstrumenter
  #     def instrument(name, payload = {})
  #       warn "Exception: #{payload["class"]}\n#{payload.inspect}"
  #     end
  #   end
  #
  #   Failbot.instrumenter = CustomInstrumenter
  #
  # The instrumenter must conform to the `ActiveSupport::Notifications`
  # interface, which defines `#instrument` and accepts:
  #
  # name    - the String name of the event (e.g. "report.failbot")
  # payload - a Hash of the exception context.
  #
  attr_accessor :instrumenter

  # Bring in sensitive data scrubber specific methods
  extend Failbot::SensitiveDataScrubber

  def push(info={}, &block)
    @config.push(info, &block)
  end

  def push_sensitive(info={}, &block)
    @config.push_sensitive(info, &block)
  end

  def pop
    @config.pop
  end

  def pop_sensitive
    @config.pop_sensitive
  end

  def hostname
    @config.hostname
  end

  def backend
    @config.backend
  end

  def backtrace_trimmer
    @config.backtrace_trimmer
  end

  def frame_processing_pipeline
    @config.frame_processing_pipeline
  end

  def context
    @config.context
  end

  def sensitive_context
    @config.sensitive_context
  end

  def remove_from_report(key)
    @config.remove_from_report(key)
  end

  def reset_context
    @config.reset_context
  end

  # see failbot/exit_hook.rb for more on these
  @failbot_loaded = true
  @auto_install_hook = false

  # This must be required before any of the method definitions below so that
  # stubbed methods are replaced properly.
  require 'failbot/exit_hook'

  EXCEPTION_DETAIL = 'exception_detail'
  SENSITIVE_CONTEXT = 'sensitive_context'

  # We'll include this many nested Exception#cause objects in the needle
  # context. We limit the number of objects to prevent excessive recursion and
  # large needle contexts.
  MAXIMUM_CAUSE_DEPTH = 2

  # Helpers needed to parse hashes included in e.g. Failbot.reports.
  def self.exception_message_from_hash(hash)
    @config.exception_formatter.exception_message_from_hash(hash)
  end

  def self.exception_classname_from_hash(hash)
    @config.exception_formatter.exception_classname_from_hash(hash)
  end

  # Public: Setup the backend for reporting exceptions.
  def setup(settings={}, default_context={})
    raise SetupError if is_setup?
    @config = Failbot::Config.configure_failbot(settings, default_context)
    yield(@config) if block_given?
  end

  # Public: your last chance to modify the context that is to be reported with an exception.
  #
  # The key value pairs that are returned from your block will get squashed into the context,
  # replacing the values of any keys that were already present.
  #
  # Example:
  #
  # Failbot.before_report do |exception, context|
  #   # context is { "a" => 1, "b" => 2 }
  #   { :a => 0, :c => 3 }
  # end
  #
  # context gets reported as { "a" => 0, "b" => "2", "c" => 3 }
  #
  def before_report(&block)
    @before_reports ||= []
    @before_reports.push(block)
  end

  # Specify a custom block for calculating rollups. It should accept:
  #
  # exception - The exception object
  # context   - The context hash
  #
  # The block must return a String.
  #
  # If a `rollup` attribute is supplied at the time of reporting, either via
  # the `failbot_context` method on an exception, or passed to `Failbot.report`,
  # it will be used as the rollup and this block will not be called.
  def rollup(&block)
    @rollup = block
  end

  # Default rollup for an exception. Exceptions with the same rollup are
  # grouped together in Haystack. The rollup is an MD5 hash of the exception
  # class and the raising file, line, and method.
  DEFAULT_ROLLUP = lambda do |exception, context, thread|
    backtrace_line = Array(exception.backtrace).first || ""
    # We want all exceptions from foo.html.erb:123 to be grouped together, no
    # matter what wacky generated ERB method name is attached to it.
    cleaned_line = backtrace_line.sub(/_erb__[_\d]+'\z/, "_erb'")

    Digest::SHA256.hexdigest("#{exception.class}#{cleaned_line}")
  end

  private_constant :DEFAULT_ROLLUP

  def use_default_rollup
    rollup(&DEFAULT_ROLLUP)
  end

  use_default_rollup

  # Public: Sends an exception to the exception tracking service along
  # with a hash of custom attributes to be included with the report. When the
  # raise_errors option is set, this method raises the exception instead of
  # reporting to the exception tracking service.
  #
  # e     - The Exception object. Must respond to #message and #backtrace.
  # other - Hash of additional attributes to include with the report.
  #
  # Examples
  #
  #   begin
  #     my_code
  #   rescue => e
  #     Failbot.report(e, :user => current_user)
  #   end
  #
  # Returns nothing.
  def report(e, other = {})
    raise MissingSetupError unless is_setup?
    return if ignore_error?(e)

    if @config.raise_errors
      squash_contexts(@config.context, exception_info(e), other) # surface problems squashing
      raise e
    else
      report!(e, other)
    end
  end

  def report!(e, other = {})
    report_with_context!(Thread.current, @config.context, @config.sensitive_context, e, other)
  end

  def report_from_thread(thread, e, other = {})
    if @config.raise_errors
      squash_contexts(@config.thread_local_context.value_from_thread(thread), exception_info(e), other) # surface problems squashing
      raise e
    else
      report_from_thread!(thread, e, other)
    end
  end

  def report_from_thread!(thread, e, other = {})
    return if ignore_error?(e)
    report_with_context!(thread, @config.thread_local_context.value_from_thread(thread), @config.thread_local_sensitive_context.value_from_thread(thread), e, other)
  end

  # Public: Disable exception reporting. This is equivalent to calling
  # `Failbot.setup("FAILBOT_REPORT" => 0)`, but can be called after setup.
  #
  #     Failbot.disable do
  #       something_that_might_go_kaboom
  #     end
  #
  # block - an optional block to perform while reporting is disabled. If a block
  #         is passed, reporting will be re-enabled after the block is called.
  def disable(&block)
    original_report_errors = @config.thread_local_report_errors.value
    @config.thread_local_report_errors.value = false

    if block
      begin
        block.call
      ensure
        @config.thread_local_report_errors.value = original_report_errors
      end
    end
  end

  # Public: Enable exception reporting. Reporting is enabled by default, but
  # this can be called if it is explicitly disabled by calling `Failbot.disable`
  # or setting `FAILBOT_REPORTING => "0"` in `Failbot.setup`.
  def enable
    @config.thread_local_report_errors.value = true
  end

  # Public: exceptions that were reported. Only available when using the
  # memory and file backends.
  #
  # Returns an Array of exceptions data Hash.
  def reports
    @config.backend.reports
  end

  # Combines all context hashes into a single hash converting non-standard
  # data types in values to strings, then combines the result with a custom
  # info hash provided in the other argument.
  #
  # other - Optional array of hashes to also squash in on top of the context
  #         stack hashes.
  #
  # Returns a Hash with all keys and values.
  def squash_contexts(*contexts_to_squash)
    squashed = {}

    contexts_to_squash.flatten.each do |hash|
      hash.each do |key, value|
        squashed[key.to_s] = value
      end
    end

    squashed
  end

  def sanitize(attrs)
    result = {}

    attrs.each do |key, value|
      result[key] =
        case value
        when Time
          value.iso8601
        when Date
          value.strftime("%F") # equivalent to %Y-%m-%d
        when Numeric
          value
        when String, true, false
          value.to_s
        when Proc
          "proc usage is deprecated"
        when Array
          if key == EXCEPTION_DETAIL
            # special-casing for the exception_detail key, which is allowed to
            # be an array with a specific structure.
            value
          else
            value.inspect
          end
        when Hash
          if key == SENSITIVE_CONTEXT
            value
          else
            value.inspect
          end
        else
          value.inspect
        end
    end

    result
  end

  def reset!
    clear_config
    clear_before_report
  end

  def clear_config
    @config = nil
  end

  def clear_before_report
    @before_reports = nil
  end

  # Extract exception info into a simple Hash.
  #
  # e - The exception object to turn into a Hash.
  #
  # Returns a Hash.
  def exception_info(e)
    res = @config.exception_formatter.call(e)
    res = populate_from_failbot_context(res, e)
    if original = (e.respond_to?(:original_exception) && e.original_exception)
      remote_backtrace  = []
      remote_backtrace << original.message
      if original.backtrace
        remote_backtrace.concat(Array(original.backtrace)[0,500])
      end
      res['remote_backtrace'] = remote_backtrace.join("\n")
    end

    res
  end

  def populate_from_failbot_context(data, e)
    if e.respond_to?(:failbot_context)
      data.merge!(fetch_failbot_context(data, e))
    else
      data
    end
  end

  def fetch_failbot_context(data, original_exception)
    original_exception.failbot_context
  rescue => exception
    log_failure_to_fetch_custom_context(exception)
    {
      "#dropped_additional_failbot_context" => true,
      "#dropped_additional_failbot_context_reason" => get_exception_type(exception),
    }
  end

  def logger
    @logger ||= Logger.new($stderr, formatter: proc { |severity, datetime, progname, msg|
      log = case msg
            when Hash
              msg.map { |k,v| "#{k}=#{v.inspect}" }.join(" ")
            else
              %Q|msg="#{msg.inspect}"|
            end
      log_line = %Q|ts="#{datetime.utc.iso8601}" level=#{severity} logger=Failbot #{log}\n|
      log_line.lstrip
    })
  end

  def logger=(logger)
    @logger = logger
  end

  def already_reporting=(bool)
    @config.thread_local_already_reporting.value = bool
  end

  def already_reporting
    @config.thread_local_already_reporting.value
  end

  private

  def is_setup?
    !!@config
  end

  def report_with_context!(thread, provided_context, sensitive_context, e, other = {})
    instrumentation_data = {}
    data = {}

    return unless @config.thread_local_report_errors.value
    return nil if ignore_error?(e)
    if already_reporting
      begin
        log_already_reporting(e)
        return nil
      rescue => failbot_exception
        handle_reporting_error(action: "processing",
           data: data,
           instrumentation_data: instrumentation_data,
           original_exception: e,
           failbot_exception: failbot_exception)
        return nil
      end
    end

    self.already_reporting = true

    begin
      data = process_exception(thread, provided_context, sensitive_context, data, e, other)
    rescue Object => failbot_exception
      handle_reporting_error(
        action: "processing",
        data: data,
        instrumentation_data: instrumentation_data,
        original_exception: e,
        failbot_exception: failbot_exception)
      return nil
    end

    start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    begin
      report_exception(data)
      handle_reporting_success(data: data, instrumentation_data: instrumentation_data, start_time: start_time)
      return nil
    rescue Object => failbot_exception
      handle_reporting_error(
          action: "reporting",
          data: data,
          instrumentation_data: instrumentation_data,
          original_exception: e,
          failbot_exception: failbot_exception,
          start_time: start_time)
      return nil
    end
  end

  def process_exception(thread, provided_context, sensitive_context, data, e, other)
    data = squash_contexts(provided_context, exception_info(e), other)
    sensitive_data = squash_contexts(sensitive_context)

    if !data.has_key?("rollup")
      data = data.merge("rollup" => @rollup.call(e, data, thread))
    end

    if defined?(@before_reports) && @before_reports
      @before_reports.each do |before_report|
        if before_report.parameters.size == 4
          new_data, new_sensitive_data = before_report.call(e, data, sensitive_data, thread)
          data = squash_contexts(data, new_data)
          sensitive_data = squash_contexts(sensitive_data, new_sensitive_data)
        else
          data = squash_contexts(data, before_report.call(e, data, thread))
        end
      end
    end

    if @config.app_override
      data = data.merge("app" => @config.app_override)
    end
    data[SENSITIVE_CONTEXT] = sensitive_data
    scrub(sanitize(data))
  end

  def report_exception(data)
    if @config.enable_timeout
      Timeout.timeout(@config.timeout_seconds) do
        @config.backend.report(data)
      end
    else
      @config.backend.report(data)
    end
  end

  def handle_reporting_success(data:, instrumentation_data:, start_time:)
    report_success(data, instrumentation_data, start_time)
    self.already_reporting = false
  end

  def handle_reporting_error(action:, data:, instrumentation_data:, original_exception:, failbot_exception:, start_time: nil)
    log_failure(action, original_exception, failbot_exception)
  rescue ReportingError => reporting_error
    log_failure_to_log(action, reporting_error)
    raise reporting_error if @config.raise_processing_errors
  ensure
    report_failure(action, data, instrumentation_data, failbot_exception, reporting_error, start_time)
    self.already_reporting = false
  end

  def report_failure(action, data, instrumentation_data, exception, reporting_error, start_time=nil)
    instrumentation_data["report_status"]  = "error"
    instrumentation_data["action"]         = action
    instrumentation_data["elapsed_ms"]     = calculate_elapsed_ms(start_time) if start_time
    instrumentation_data["exception_type"] = reporting_error ? reporting_error.class.name : exception&.class&.name
    instrumentation_data["exception"]      = reporting_error || exception
    instrument("report.failbot", data.merge(instrumentation_data)) rescue nil
  end

  def report_success(data, instrumentation_data, start_time)
    instrumentation_data["report_status"]  = "success"
    instrumentation_data["elapsed_ms"]     = calculate_elapsed_ms(start_time)
    instrument("report.failbot", data.merge(instrumentation_data)) rescue nil
  end

  def calculate_elapsed_ms(start_time)
    ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time) * 1000).to_i
  end

  # Internal: Publish an event to the instrumenter
  def instrument(name, payload = {})
    Failbot.instrumenter.instrument(name, payload) if Failbot.instrumenter
  end

  def log_already_reporting(original_exception)
    record = {
      "msg" => "failbot asked to report while already reporting",
      "action" => "processing"
    }
    record.merge!(to_semconv(original_exception))
    logger.debug record
  end

  def log_failure(action, original_exception, exception)
    begin
      record = {
        "msg" => "report-failed",
        "action" => action,
      }
      record.merge!(to_semconv(original_exception))
      record.merge!(failbot_exception_details(exception))
      logger.error record
    rescue
      raise ReportingError
    end
  end

  def log_failure_to_log(action, exception)
    record = {
      "msg" => "exception",
      "action" => action,
    }
    record.merge!(to_semconv(exception))
    record.merge!(failbot_exception_details(exception.cause))
    logger.error record
  end

  def log_failure_to_fetch_custom_context(exception)
    record = {
      "msg" => "exception",
      "action" => "fetching_custom_failbot_context",
    }
    record.merge!(to_semconv(exception))
    logger.error record
  end

  def to_semconv(exception)
    {
      "exception.type" => get_exception_type(exception),
      "exception.message" => get_exception_message(exception),
      "exception.backtrace" =>get_exception_backtrace(exception)
    }
  end

  def failbot_exception_details(exception)
    {
      "failbot.exception.type" => get_exception_type(exception),
      "failbot.exception.message" => get_exception_message(exception),
      "failbot.exception.backtrace" => get_exception_backtrace(exception),
    }
  end

  def get_exception_type(exception)
    exception.class.to_s
  end

  def get_exception_message(exception)
    exception.message.encode("UTF-8", invalid: :replace, undef: :replace, replace: '�')
  end

  def get_exception_backtrace(exception)
    exception.full_message(highlight: false, order: :top).encode('UTF-8', invalid: :replace, undef: :replace, replace: '�')
  end


  def ignore_error?(error)
    @cache ||= Hash.new do |hash, error_class|
      hash[error_class] = @config.ignored_error_classes.any? do |ignored_error_class|
        error_class.ancestors.include?(ignored_error_class)
      end
    end

    @cache[error.class]
  end

  extend self

  # If the library was lazy loaded due to failbot/exit_hook.rb and a delayed
  # config is set, configure the library now.
  if @delayed_settings
    setup(@delayed_settings, @delayed_default_context, &@block)
    @delayed_settings = nil
    @delayed_default_context = nil
    @block = nil
  end
end
