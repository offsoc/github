require 'net/https'
require 'uri'
require 'json'

module Failbot
  class Haystack
    attr_accessor :connect_timeout, :rw_timeout
    def initialize(url, connect_timeout=nil, timeout_seconds=nil)
      @url = url
      @connect_timeout = connect_timeout
      @rw_timeout = timeout_seconds - @connect_timeout.to_f if timeout_seconds
    end

    def user
      @url.user || "failbot"
    end

    def password
      @url.password
    end

    def send_data(data)
      # make a post
      post = Net::HTTP::Post.new(@url.path)
      post.set_form_data('json' => data.to_json)
      response = send_request(post)

      # Raise if the exception doesn't make it to Haystack, ensures the failure
      # is logged
      raise StandardError, "couldn't send exception to Haystack: #{response.code} #{response.message}" unless response.code == "201"
    end

    def self.send_data(data)
      new(Failbot.haystack).send_data(data)
    end

    def ping
      request = Net::HTTP::Head.new('/')
      response = send_request(request)
      raise StandardError, "haystack returned #{response.code}" unless response.code == "200"
    end

    private

    def send_request(request)
      if user && password
        request.basic_auth(user, password)
      end

      # make request
      http = Net::HTTP.new(@url.host, @url.port)

      # use SSL if applicable
      http.use_ssl = true if @url.scheme == "https"

      # Set the connect timeout if it was provided
      http.open_timeout = @connect_timeout if @connect_timeout
      http.read_timeout = @rw_timeout if @rw_timeout
      http.write_timeout = @rw_timeout if @rw_timeout

      # push it through
      http.request(request)
    ensure
      if defined?(http) && http.started?
        http.finish
      end
    end
  end
end
