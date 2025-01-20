module Failbot
  # Rack middleware that rescues exceptions raised from the downstream app and
  # reports to failbot. The exception is reraised after being sent to haystack
  # so upstream middleware can still display an error page or whathaveyou.
  class Rescuer
    def initialize(app, other)
      @app   = app
      @other = other
    end

    def call(env)
      Failbot.reset!
      Failbot.push @other.merge(self.class.context(env))
      begin
        start = Time.now
        @app.call(env)
      rescue Object => boom
        elapsed = Time.now - start
        Failbot.report(boom, {:time => elapsed.to_s})
        raise
      end
    ensure
      Failbot.reset!
    end

    def self.context(env)
      request = Rack::Request.new(env.dup)
      params = {}
      begin
        params = request.params
      rescue
        env["rack.input"].rewind
      end

      {
        :method       => request.request_method,
        :user_agent   => env['HTTP_USER_AGENT'],
        :params       => filtered_parameters(env, params),
        :session      => filtered_parameters(env, (request.session.to_hash rescue {})),
        :referrer     => request.referrer,
        :remote_ip    => request.ip,
        :url          => request.url
      }
    end

    def self.report(exception, env, other = {})
      Failbot.report(exception, other.merge(context(env)))
    end

    def self.filtered_parameters(env, params)
      if env['filter_words']
        filter_parameters(env['filter_words'], params)
      else
        params
      end
    end

    # Borrowed from Rails.
    def self.filter_parameters(filter_words, unfiltered_parameters)
      parameter_filter = Regexp.new(filter_words.collect{ |s| s.to_s }.join('|'), true) if filter_words.length > 0

      filtered_parameters = {}

      unfiltered_parameters.each do |key, value|
        if key =~ parameter_filter
          filtered_parameters[key] = '[FILTERED]'
        elsif value.is_a?(Hash)
          filtered_parameters[key] = filter_parameters(filter_words, value)
        elsif value.is_a?(Array)
          filtered_parameters[key] = value.collect do |item|
            case item
            when Hash, Array
              filter_parameters(filter_words, item)
            else
              item
            end
          end
        elsif block_given?
          key = key.dup
          value = value.dup if value.duplicable?
          yield key, value
          filtered_parameters[key] = value
        else
          filtered_parameters[key] = value
        end
      end

      filtered_parameters
    end
  end
end
