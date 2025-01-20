module Failbot
  class Config

    class InvalidSettingsError < StandardError
      def initialize
        super("Improper Failbot.setup usage. See https://github.com/github/failbot for details.")
      end
    end

    EXCEPTION_FORMATS = {
      :haystack => ExceptionFormat::Haystack,
      :structured => ExceptionFormat::Structured
    }

    attr_reader :frame_processing_pipeline, :thread_local_context, :thread_local_sensitive_context,
                :thread_local_already_reporting, :raise_processing_errors,
                :enable_timeout, :timeout_seconds, :connect_timeout_seconds, :backend, :raise_errors,
                :thread_local_report_errors, :app_override, :exception_formatter, :ignored_error_classes,
                :backtrace_trimmer

    def self.configure_failbot(settings, default_context)
      new(settings, default_context).tap do |config|
        config.configure_failbot
      end
    end

    def initialize(settings, default_context)
      @settings = settings
      @default_context = default_context
      @frame_processing_pipeline = []
    end

    def register_frame_processing_pipeline(pipeline)
      @frame_processing_pipeline = pipeline
    end

    def configure_failbot
      validate_settings
      set_catalog_service_in_default_context
      set_thread_local_context
      set_thread_local_already_reporting
      populate_context_from_settings
      set_raise_processing_errors
      set_enable_timeout
      set_connect_timeout
      set_backend
      set_raise_errors
      set_thread_local_report_errors
      set_app_override
      set_exception_formatter
      set_ignored_error_classes
      set_backtrace_trimmer
    end

    def validate_settings
      deprecated_settings = %w[ backend host port haystack raise_errors ]
      if @settings.empty? || !(@settings.keys & deprecated_settings).empty?
        raise InvalidSettingsError
      end
    end

    # Stack of context information to include in the next failbot report. These
    # hashes are condensed down into one and included in the next report. Don't
    # mess with this structure directly - use the #push and #pop methods.
    def context
      @thread_local_context.value
    end

    def sensitive_context
      @thread_local_sensitive_context.value
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

    def push_sensitive(info={})
      info.each do |key, value|
        if value.kind_of?(Proc)
          raise ArgumentError, "Proc usage has been removed from Failbot"
        end
      end
      sensitive_context.push(info)
      yield if block_given?
    ensure
      pop_sensitive if block_given?
    end

    # Remove the last info hash from the context stack.
    def pop
      context.pop if context.size > 1
    end

    def pop_sensitive
      sensitive_context.pop if sensitive_context.size > 1
    end

    def reset_context
      @thread_local_context.value = [context[0]].dup
      @thread_local_sensitive_context.value = [sensitive_context[0]].dup
    end

    def remove_from_report(key)
      context.each do |hash|
        hash.delete(key.to_s)
        hash.delete(key.to_sym)
      end
    end

    def hostname
      @hostname ||= Socket.gethostname
    end


    private

    def set_thread_local_context
      initial_context = if @default_context.respond_to?(:to_hash) && !@default_context.to_hash.empty?
          @default_context.to_hash
        else
          { "server" => hostname }
        end
      initial_context["server"] = hostname if initial_context["server"]&.empty? || !initial_context["server"]
      @thread_local_context = Failbot::ThreadLocalVariable.new do
        [initial_context]
      end
      @thread_local_sensitive_context = Failbot::ThreadLocalVariable.new do
        [{}]
      end
    end

    def set_thread_local_already_reporting
      @thread_local_already_reporting = ::Failbot::ThreadLocalVariable.new { false }
    end

    def set_raise_processing_errors
      @raise_processing_errors = raise_processing_errors?
    end

    def set_enable_timeout
      @enable_timeout = false
      if @settings.key?("FAILBOT_TIMEOUT_MS")
        @timeout_seconds = Float(@settings.fetch("FAILBOT_TIMEOUT_MS", "0")) / 1000
        @enable_timeout = (@timeout_seconds > 0.0)
      end
    end

    def set_connect_timeout
      @connect_timeout_seconds = nil
      if @settings.key?("FAILBOT_CONNECT_TIMEOUT_MS")
        @connect_timeout_seconds = Float(@settings.fetch("FAILBOT_CONNECT_TIMEOUT_MS", "0")) / 1000
        # unset the value if it's not parsing to something valid
        @connect_timeout_seconds = nil unless @connect_timeout_seconds > 0
      end
    end

    def set_backend
      @backend =
        case (name = @settings["FAILBOT_BACKEND"])
        when "memory"
          Failbot::MemoryBackend.new
        when "waiter"
          Failbot::WaiterBackend.new
        when "file"
          Failbot::FileBackend.new(@settings["FAILBOT_BACKEND_FILE_PATH"])
        when "http"
          Failbot::HTTPBackend.new(URI(@settings["FAILBOT_HAYSTACK_URL"]), @connect_timeout_seconds, @timeout_seconds, circuit_breaker_properties)
        when 'console'
          Failbot::ConsoleBackend.new
        when 'json'
          raise ArgumentError, "JSON backend is deprecated. Please remove use of this backend in your service. See https://github.com/github/failbot/pull/204 for more information."
        else
          raise ArgumentError, "Unknown backend: #{name.inspect}"
        end
    end

    def set_raise_errors
      @raise_errors  = !@settings["FAILBOT_RAISE"].to_s.empty?
    end

    def set_thread_local_report_errors
      @thread_local_report_errors = ::Failbot::ThreadLocalVariable.new do
        @settings["FAILBOT_REPORT"] != "0"
      end
    end

    def set_app_override
      @app_override = @settings["FAILBOT_APP_OVERRIDE"]
    end

    def set_catalog_service_in_default_context
      unless @default_context["catalog_service"]
        @default_context["catalog_service"] = ENV["OTEL_SERVICE_NAME"] || @default_context["app"]
      end
    end

    def set_exception_formatter
      exception_format = :structured
      if @settings["FAILBOT_EXCEPTION_FORMAT"]
        exception_format = @settings["FAILBOT_EXCEPTION_FORMAT"].to_sym
      end
      @exception_formatter = EXCEPTION_FORMATS.fetch(exception_format) do
        raise ArgumentError, "#{exception_format} is not an available exception_format (want one of #{EXCEPTION_FORMATS.keys})"
      end
    end

    def set_ignored_error_classes
      @ignored_error_classes = @settings.fetch("FAILBOT_IGNORED_ERROR_CLASSES", "").split(",").map do |class_name|
        Module.const_get(class_name.strip)
      end
    end

    def set_backtrace_trimmer
      truncate_exception_types        = @settings.fetch("FAILBOT_TRUNCATE_EXCEPTION_TYPES", "").split(",").map(&:strip)
      stacktrace_frame_limit          = @settings.fetch("FAILBOT_STACKTRACE_FRAME_LIMIT", "500")
      @backtrace_trimmer = Failbot::Backtrace::Trimmer.new(stacktrace_frame_limit, truncate_exception_types)
    end
    # Populate default context from settings.  Since settings commonly comes from
    # ENV, this allows setting defaults for the context via the environment.
    def populate_context_from_settings
      @settings.each do |key, value|
        if /\AFAILBOT_CONTEXT_(.+)\z/ =~ key
          key = $1.downcase
          context[0][key] = value unless context[0][key]
        end
      end
    end

    def circuit_breaker_properties
      {
        # seconds after tripping circuit before allowing retry
        sleep_window_seconds: Integer(@settings.fetch('FAILBOT_CB_SLEEP_WINDOW_SECONDS', '5')),
        # number of requests that must be made within a statistical window before open/close decisions are made using stats
        request_volume_threshod: Integer(@settings.fetch('FAILBOT_CB_REQUEST_VOLUME_THRESHOLD', '20')),
        # % of "marks" that must be failed to trip the circuit
        error_threshold_percentage: Integer(@settings.fetch('FAILBOT_CB_ERROR_THRESHOLD_PERCENTAGE', '50')),
        # number of seconds in the statistical window
        window_size_in_seconds: Integer(@settings.fetch('FAILBOT_CB_WINDOW_SIZE_IN_SECONDS', '60')),
        # size of buckets in statistical window
        bucket_size_in_seconds: Integer(@settings.fetch('FAILBOT_CB_BUCKET_SIZE_IN_SECONDS', '10')),
      }
    end

    def raise_processing_errors?
      raise_processing_error_setting_value = @settings["FAILBOT_RAISE_PROCESSING_ERRORS"]
      return true unless raise_processing_error_setting_value
      raise_processing_error_setting_value  == "true"
    end
  end
end
