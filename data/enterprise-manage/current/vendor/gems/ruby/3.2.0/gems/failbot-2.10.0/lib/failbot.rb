require 'yaml'
require 'digest/sha2'
require 'logger'
require 'socket'
require "time"
require "timeout"
require "date"
require "uri"

require 'failbot/version'
require "failbot/compat"
require "failbot/sensitive_data_scrubber"
require "failbot/exception_format/haystack"
require "failbot/exception_format/structured"
require "failbot/default_backtrace_parser"

# Failbot asynchronously takes exceptions and reports them to the
# exception logger du jour. Keeps the main app from failing or lagging if
# the exception logger service is down or slow.
module Failbot
  # Interface for posting exception data to haystack.
  autoload :Haystack, 'failbot/haystack'

  autoload :ConsoleBackend, 'failbot/console_backend'
  autoload :FileBackend,    'failbot/file_backend'
  autoload :HTTPBackend,    'failbot/http_backend'
  autoload :MemoryBackend,  'failbot/memory_backend'
  autoload :JSONBackend,    'failbot/json_backend'
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

  # Root directory of the project's source. Used to clean up stack traces if the exception format supports it

  def source_root=(str)
    @source_root = if str
      File.join(str, '')
    end
  end

  attr_reader :source_root

  # see failbot/exit_hook.rb for more on these
  @failbot_loaded = true
  @auto_install_hook = false

  # This must be required before any of the method definitions below so that
  # stubbed methods are replaced properly.
  require 'failbot/exit_hook'

  EXCEPTION_DETAIL = 'exception_detail'

  # We'll include this many nested Exception#cause objects in the needle
  # context. We limit the number of objects to prevent excessive recursion and
  # large needle contexts.
  MAXIMUM_CAUSE_DEPTH = 2

  # Enumerates the available exception formats this gem supports.  The original
  # format and the default is :haystack and the newer format is :structured
  EXCEPTION_FORMATS = {
    :haystack => ExceptionFormat::Haystack,
    :structured => ExceptionFormat::Structured
  }

  # Set the current exception format.
  def self.exception_format=(identifier)
    @exception_formatter = EXCEPTION_FORMATS.fetch(identifier) do
      fail ArgumentError, "#{identifier} is not an available exception_format (want one of #{EXCEPTION_FORMATS.keys})"
    end
  end

  # Default to the original exception format used by haystack unless
  # apps opt in to the newer version.
  self.exception_format = :structured

  # Set a callable that is responsible for parsing and formatting ruby
  # backtraces.  This is only necessary to set if your app deals with
  # exceptions that are manipulated to contain something other than actual
  # stackframe strings in the format produced by `caller`.  The argument passed
  # must respond to `call` with an arity of 1.  The callable expects to be
  # passed Exception instances as its argument.
  def self.backtrace_parser=(callable)
    unless callable.respond_to?(:call)
      raise ArgumentError, "backtrace_parser= passed #{callable.inspect}, which is not callable"
    end
    if callable.method(:call).arity != 1
      raise ArgumentError, "backtrace_parser= passed #{callable.inspect}, whose `#call` has arity =! 1"
    end
    @backtrace_parser = callable
  end

  attr_reader :backtrace_parser

  # Default backtrace parser is provided:
  self.backtrace_parser = ::Failbot::DefaultBacktraceParser

  # Helpers needed to parse hashes included in e.g. Failbot.reports.
  def self.exception_message_from_hash(hash)
    @exception_formatter.exception_message_from_hash(hash)
  end

  def self.exception_classname_from_hash(hash)
    @exception_formatter.exception_classname_from_hash(hash)
  end

  # Public: Setup the backend for reporting exceptions.
  def setup(settings={}, default_context={})
    deprecated_settings = %w[
      backend host port haystack
      raise_errors
    ]

    if settings.empty? ||
      settings.keys.any? { |key| deprecated_settings.include?(key) }
      warn "%s Deprecated Failbot.setup usage. See %s for details." % [
        caller[0], "https://github.com/github/failbot"
      ]
      return setup_deprecated(settings)
    end

    initial_context = if default_context.respond_to?(:to_hash) && !default_context.to_hash.empty?
                        default_context.to_hash
                      else
                        { 'server' => hostname }
                      end

    @thread_local_context = ::Failbot::ThreadLocalVariable.new do
      [initial_context]
    end
    @thread_local_already_reporting = ::Failbot::ThreadLocalVariable.new { false }

    populate_context_from_settings(settings)
    @enable_timeout = false
    if settings.key?("FAILBOT_TIMEOUT_MS")
      @timeout_seconds = settings["FAILBOT_TIMEOUT_MS"].to_f / 1000
      @enable_timeout = (@timeout_seconds > 0.0)
    end

    @connect_timeout_seconds = nil
    if settings.key?("FAILBOT_CONNECT_TIMEOUT_MS")
      @connect_timeout_seconds = settings["FAILBOT_CONNECT_TIMEOUT_MS"].to_f / 1000
      # unset the value if it's not parsing to something valid
      @connect_timeout_seconds = nil unless @connect_timeout_seconds > 0
    end

    self.backend =
      case (name = settings["FAILBOT_BACKEND"])
      when "memory"
        Failbot::MemoryBackend.new
      when "waiter"
        Failbot::WaiterBackend.new
      when "file"
        Failbot::FileBackend.new(settings["FAILBOT_BACKEND_FILE_PATH"])
      when "http"
        Failbot::HTTPBackend.new(URI(settings["FAILBOT_HAYSTACK_URL"]), @connect_timeout_seconds, @timeout_seconds)
      when 'json'
        Failbot::JSONBackend.new(settings["FAILBOT_BACKEND_JSON_HOST"], settings["FAILBOT_BACKEND_JSON_PORT"])
      when 'console'
        Failbot::ConsoleBackend.new
      else
        raise ArgumentError, "Unknown backend: #{name.inspect}"
      end

    @raise_errors  = !settings["FAILBOT_RAISE"].to_s.empty?
    @thread_local_report_errors = ::Failbot::ThreadLocalVariable.new do
      settings["FAILBOT_REPORT"] != "0"
    end

    # allows overriding the 'app' value to send to single haystack bucket.
    # used primarily on ghe.io.
    @app_override = settings["FAILBOT_APP_OVERRIDE"]

    # Support setting exception_format from ENV/settings
    if settings["FAILBOT_EXCEPTION_FORMAT"]
      self.exception_format = settings["FAILBOT_EXCEPTION_FORMAT"].to_sym
    end

    @ignored_error_classes = settings.fetch("FAILBOT_IGNORED_ERROR_CLASSES", "").split(",").map do |class_name|
      Module.const_get(class_name.strip)
    end
  end

  # Bring in deprecated methods
  extend Failbot::Compat
  # Bring in sensitive data scrubber specific methods
  extend Failbot::SensitiveDataScrubber

  # Stack of context information to include in the next failbot report. These
  # hashes are condensed down into one and included in the next report. Don't
  # mess with this structure directly - use the #push and #pop methods.
  def context
    @thread_local_context.value
  end

  # Add info to be sent in the next failbot report, should one occur.
  #
  # info  - Hash of name => value pairs to include in the exception report.
  # block - When given, the info is removed from the current context after the
  #         block is executed.
  #
  # Returns the value returned by the block when given; otherwise, returns nil.
  def push(info={})
    info.each do |key, value|
      if value.kind_of?(Proc)
        raise ArgumentError, "Proc usage has been removed from Failbot"
      end
    end
    context.push(info)
    yield if block_given?
  ensure
    pop if block_given?
  end

  # Remove the last info hash from the context stack.
  def pop
    context.pop if context.size > 1
  end

  # Reset the context stack to a pristine state.
  def reset!
    @thread_local_context.value = [context[0]].dup
  end

  # Loops through the stack of contexts and deletes the given key if it exists.
  #
  # key - Name of key to remove.
  #
  # Examples
  #
  #   remove_from_report(:some_key)
  #
  #   remove_from_report("another_key")
  #
  # Returns nothing.
  def remove_from_report(key)
    context.each do |hash|
      hash.delete(key.to_s)
      hash.delete(key.to_sym)
    end
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
    @before_report = block
  end

  # For tests
  def clear_before_report
    @before_report = nil
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
    return if ignore_error?(e)

    if @raise_errors
      squash_contexts(context, exception_info(e), other) # surface problems squashing
      raise e
    else
      report!(e, other)
    end
  end

  def report!(e, other = {})
    report_with_context!(Thread.current, context, e, other)
  end

  def report_from_thread(thread, e, other = {})
    if @raise_errors
      squash_contexts(@thread_local_context.value_from_thread(thread), exception_info(e), other) # surface problems squashing
      raise e
    else
      report_from_thread!(thread, e, other)
    end
  end

  def report_from_thread!(thread, e, other = {})
    return if ignore_error?(e)

    report_with_context!(thread, @thread_local_context.value_from_thread(thread), e, other)
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
    original_report_errors = @thread_local_report_errors.value
    @thread_local_report_errors.value = false

    if block
      begin
        block.call
      ensure
        @thread_local_report_errors.value = original_report_errors
      end
    end
  end

  # Public: Enable exception reporting. Reporting is enabled by default, but
  # this can be called if it is explicitly disabled by calling `Failbot.disable`
  # or setting `FAILBOT_REPORTING => "0"` in `Failbot.setup`.
  def enable
    @thread_local_report_errors.value = true
  end

  # Public: exceptions that were reported. Only available when using the
  # memory and file backends.
  #
  # Returns an Array of exceptions data Hash.
  def reports
    backend.reports
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
        else
          value.inspect
        end
    end

    result
  end

  # Extract exception info into a simple Hash.
  #
  # e - The exception object to turn into a Hash.
  #
  # Returns a Hash.
  def exception_info(e)
    res = @exception_formatter.call(e)

    if exception_context = (e.respond_to?(:failbot_context) && e.failbot_context)
      res.merge!(exception_context)
    end

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

  def hostname
    @hostname ||= Socket.gethostname
  end

  def already_reporting=(bool)
    @thread_local_already_reporting.value = bool
  end

  def already_reporting
    @thread_local_already_reporting.value
  end

  private

  def report_with_context!(thread, provided_context, e, other = {})
    return unless @thread_local_report_errors.value
    return if ignore_error?(e)

    if already_reporting
      logger.warn "FAILBOT: asked to report while reporting!" rescue nil
      logger.warn e.message rescue nil
      logger.warn e.backtrace.join("\n") rescue nil
      return
    end
    self.already_reporting = true

    begin
      data = squash_contexts(provided_context, exception_info(e), other)

      if !data.has_key?("rollup")
        data = data.merge("rollup" => @rollup.call(e, data, thread))
      end

      if defined?(@before_report) && @before_report
        data = squash_contexts(data, @before_report.call(e, data, thread))
      end

      if @app_override
        data = data.merge("app" => @app_override)
      end

      data = scrub(sanitize(data))
    rescue Object => i
      log_failure("processing", data, e, i)
      self.already_reporting = false
      return
    end

    start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    instrumentation_data = {
      "report_status" => "error",
    }
    begin
      if @enable_timeout
        Timeout.timeout(@timeout_seconds) do
          backend.report(data)
        end
      else
        backend.report(data)
      end
      instrumentation_data["report_status"] = "success"
    rescue Object => i
      log_failure("reporting", data, e, i)
      instrumentation_data["exception_type"] = i.class.name
    ensure
      instrumentation_data["elapsed_ms"] = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time) * 1000).to_i
      instrument("report.failbot", data.merge(instrumentation_data)) rescue nil
      self.already_reporting = false
    end
  end

  # Internal: Publish an event to the instrumenter
  def instrument(name, payload = {})
    Failbot.instrumenter.instrument(name, payload) if Failbot.instrumenter
  end

  # Populate default context from settings.  Since settings commonly comes from
  # ENV, this allows setting defaults for the context via the environment.
  def populate_context_from_settings(settings)
    settings.each do |key, value|
      if /\AFAILBOT_CONTEXT_(.+)\z/ =~ key
        key = $1.downcase
        context[0][key] = value unless context[0][key]
      end
    end
  end

  def log_failure(action, data, original_exception, exception)
    begin
      record = {
        "msg" => "exception",
        "action" => action,
        "data" => data,
      }

      record.merge!(to_semconv(exception))
      logger.debug record

      record = {
        "msg" => "report-failed",
        "action" => action,
        "data" => data,
      }
      record.merge!(to_semconv(original_exception))
      logger.debug record
    rescue => e
      raise e
    end
  end

  def to_semconv(exception)
    {
      "exception.type" => exception.class.to_s,
      "exception.message" => exception.message.encode("UTF-8", invalid: :replace, undef: :replace, replace: '�'),
      "exception.backtrace" => exception.full_message(highlight: false, order: :top).encode('UTF-8', invalid: :replace, undef: :replace, replace: '�'),
    }
  end

  def ignore_error?(error)
    @cache ||= Hash.new do |hash, error_class|
      hash[error_class] = @ignored_error_classes.any? do |ignored_error_class|
        error_class.ancestors.include?(ignored_error_class)
      end
    end

    @cache[error.class]
  end

  extend self

  # If the library was lazy loaded due to failbot/exit_hook.rb and a delayed
  # config is set, configure the library now.
  if @delayed_settings
    setup(@delayed_settings, @delayed_default_context)
    @delayed_settings = nil
    @delayed_default_context = nil
  end
end
