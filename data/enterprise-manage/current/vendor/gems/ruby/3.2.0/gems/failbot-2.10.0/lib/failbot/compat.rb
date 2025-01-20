module Failbot
  module Compat
    # DEPRECATED Reset the backend and optionally override the environment
    # configuration.
    #
    # config - The optional configuration Hash.
    #
    # Returns nothing.
    def setup_deprecated(_config={})
      config.merge!(_config)
      @backend = nil
      @raise_errors = nil
    end

    # The current "environment". This dictates which section will be read
    # from the failbot.yml config file.
    def environment
      warn "#{caller[0]} Failbot.environment is deprecated and will be " \
        "removed in subsequent releases."
      @environment ||= ENV['FAILBOT_ENV'] || ENV['RAILS_ENV'] || ENV['RACK_ENV'] || 'development'
    end

    # Hash of configuration data from lib/failbot/failbot.yml.
    def config
      warn "#{caller[0]} Failbot.config is deprecated and will be " \
        "removed in subsequent releases."
      @config ||= YAML.load_file(config_file)[environment]
    end

    # Location of failbot.yml config file.
    def config_file
      warn "#{caller[0]} Failbot.config_file is deprecated and will be " \
        "removed in subsequent releases."
      File.expand_path('../../failbot/failbot.yml', __FILE__)
    end

    # The name of the backend that should be used to post exceptions to the
    # exceptions-collection service. The fellowing backends are available:
    #
    # memory - Dummy backend that simply save exceptions in memory. Typically
    #          used in testing environments.
    #
    # file   - Append JSON-encoded exceptions to a file.
    #
    # Returns the String backend name. See also `Failbot.backend`.
    def backend_name
      warn "#{caller[0]} Failbot.backend_name is deprecated and will be " \
        "removed in subsequent releases."
      config['backend']
    end

    # Determines whether exceptions are raised instead of being reported to
    # the exception tracking service. This is typically enabled in development
    # and test environments. When set true, no exception information is reported
    # and the exception is raised instead. When false (default in production
    # environments), the exception is reported to the exception tracking service
    # but not raised.
    def raise_errors?
      warn "#{caller[0]} Failbot.raise_errors? is deprecated and will be " \
        "removed in subsequent releases."

      if @raise_errors.nil?
        config['raise_errors']
      else
        @raise_errors
      end
    end

    def raise_errors=(v)
      warn "#{caller[0]} Failbot.raise_errors= is deprecated and will be " \
        "removed in subsequent releases."
      @raise_errors = v
    end

    def report_errors?
      warn "#{caller[0]} Failbot.report_errors? is deprecated and will be " \
        "removed in subsequent releases."

      if @thread_local_report_errors.nil?
        config['report_errors']
      else
        @thread_local_report_errors.value
      end
    end

    def report_errors=(v)
      warn "#{caller[0]} Failbot.report_errors= is deprecated and will be " \
        "removed in subsequent releases."
      @thread_local_report_errors.value = v
    end

    # Load and initialize the exception reporting backend as specified by
    # the 'backend' configuration option.
    #
    # Raises ArgumentError for invalid backends.
    def backend
      @backend ||= backend!
    end
    attr_writer :backend

    def backend!
      warn "#{caller[0]} Failbot.backend! is deprecated and will be " \
        "removed in subsequent releases."
      case backend_name
      when 'memory'
        Failbot::MemoryBackend.new
      when 'file'
        Failbot::FileBackend.new(config['file_path'])
      else
        raise ArgumentError, "Unknown backend: #{backend_name.inspect}"
      end
    end

    # The URL where exceptions should be posted. Each exception is converted into
    # JSON and posted to this URL.
    def haystack
      warn "#{caller[0]} Failbot.haystack is deprecated and will be " \
        "removed in subsequent releases."
      config['haystack']
    end

    # Send the exception data to the relay service using
    # a non-waiting cast call.
    #
    # data - Hash of string key => string value pairs.
    #
    # Returns nothing.
    def cast(data)
      warn "#{caller[0]} Failbot.cast is deprecated and will be " \
        "removed in subsequent releases."
      backend.report(data)
    end

    def fail
      warn "#{caller[0]} Failbot.fail is deprecated and will be " \
        "removed in subsequent releases."
      raise "failure failure!"
    end

    def default_options
      warn "#{caller[0]} Failbot.default_options is deprecated and will be " \
        "removed in subsequent releases."
      context[0]
    end

    def default_options=(hash)
      warn "#{caller[0]} Failbot.default_options= is deprecated. Please use " \
        "Failbot.setup(ENV, context={}) instead."
      context[0] = hash
    end
  end
end
