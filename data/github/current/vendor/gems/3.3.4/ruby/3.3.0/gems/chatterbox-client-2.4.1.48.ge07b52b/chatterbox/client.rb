require 'net/http'
require 'json'
require 'cgi'

module Chatterbox
  GREEN  = '#4B9611'
  RED    = '#CC1D34'
  YELLOW = '#EBD249'

  class Error < StandardError
    # A Net::HTTP response (or something duck-typing #code and #response) that
    # was associated with posting this message. May or may not be available,
    # but note that Error can be raised in situations that can also raise
    # network errors.
    attr_accessor :response
  end

  # Chatterbox::Error is the preferred version, but a few releases had SayError,
  # so we keep it around for compatibility
  SayError = Error

  # Post things to chatterbox!
  #
  # Set a CHATTERBOX_TOKEN environment variable to use this.
  #
  # You can also optionally set a CHATTERBOX_URL to something like
  # http://chatterbox.localhost
  module Client
    # Post a message to a chatterbox topic.
    #
    # topic - The String topic to post to. For direct message use @user_handle as a topic
    # msg   - The String message to post
    #
    # Returns truthy if the message posted successfully. Raises a
    # Chatterbox::Error if an error was returned.
    def self.say(topic, msg, options = {})
      topic = topic.to_s
      path = "/topics/#{CGI.escape(topic)}"
      options = { text: msg }.merge(options)

      return test_say(topic, msg, options) if test_mode?

      response = post(path, options)
      unless %w[200 201 202].include?(response.code)
        err = Error.new 'Chatterbox message failed to post'
        err.response = response
        raise err
      end
      response
    end

    # The same thing as .say, but will never raise an exception.
    #
    # topic - The String topic to post to
    # msg   - The String message to post
    #
    # Returns true if the message posted successfully
    def self.say!(topic, msg)
      say(topic, msg)
    rescue Object
      false
    end

    # Print a message that will appear, in slack, with a colored bar
    # to decorate it.
    #
    # topic - The String topic to post to
    # color - The String HTML color or slack color bar to decorate a message with
    # msg   - The String message to post
    #
    # Returns true if the message posted successfully
    def self.colored_say(topic, color, msg, options = {})
      options = {
        attachments:
          [{
            text: msg,
            color:,
            fallback: msg
          }]
      }.merge(options)

      say topic, msg, options
    end

    # The same as .colored_say, but will never raise an exception.
    #
    # topic - The String topic to post to
    # color - The String HTML color or slack color bar to decorate a message with
    # msg   - The String message to post
    #
    # Returns true if the message posted successfully
    def self.colored_say!(topic, color, msg)
      colored_say(topic, color, msg)
    rescue Object
      false
    end

    # Upload a file to a chatterbox topic.
    #
    # topic     - The String topic to post to. For direct message use @user_handle as a topic
    # filename  - The filename with extension of the file to post
    # content   - The content of the file as an IO object or text
    # comment   - The comment to post with the file, defaults to empty string
    #
    # Returns truthy if the message posted successfully. Raises a
    # Chatterbox::Error if an error was returned.
    def self.upload_say(topic, filename, content, comment = '')
      topic = topic.to_s
      path = "/topics/#{CGI.escape(topic)}"

      return test_upload_say(topic, filename, content, comment) if test_mode?

      # Use multipart/form-data to upload the file
      form_parts = [['file', content, { filename: }], ['filename', filename], ['comment', comment]]
      response = post_multipart(path, form_parts)

      unless %w[200 201 202].include?(response.code)
        err = Error.new 'Chatterbox message failed to post'
        err.response = response
        raise err
      end
      response
    end

    # The same as .upload_say, but will never raise an exception.
    #
    # topic     - The String topic to post to. For direct message use @user_handle as a topic
    # filename  - The filename with extension of the file to post
    # content   - The content of the file as an IO object or text
    # comment   - The comment to post with the file, defaults to empty string
    #
    # Returns truthy if the message posted successfully.
    def self.upload_say!(topic, filename, content, comment = '')
      upload_say(topic, filename, content, comment)
    rescue Object
      false
    end

    # Subscribe a room to a topic
    #
    # adapter -     The adapter to subscribe
    # adapter_id -  The adapter_id to subscribe
    # topic -       The topic to subscribe a room to
    #
    # REturns true if the subscription was created
    def self.subscribe(adapter, adapter_id, topic)
      response = post('/subscriptions', adapter:,
                                        adapter_id:,
                                        topic:)
      %w[201 409].include?(response.code)
    end

    def self.subscriptions(adapter, adapter_id)
      adapter_id = CGI.escape(adapter_id)
      response = get("/subscriptions/#{adapter}/#{adapter_id}")
      unless response.code == '200'
        err = Error.new "chatterbox returned #{response.code}"
        err.response = response
        raise err
      end

      JSON.parse(response.body)['topics']
    end

    # Create a new room
    # Creates a new room. Will default to slack and create a channel
    # if the room name begins with a '#'.
    #
    # name        - The name of the room to create
    # description - The optional description of the room to create
    # adapter     - Optionally the adapter to create the room on
    #
    # Returns true if the room was created
    def self.create_room(name, description = nil, adapter = nil)
      response = post('/rooms', name:, description:, adapter:)
      unless response.code == '200' || response.code == '201'
        err = Error.new "chatterbox returned #{response.code}"
        err.response = response
        raise err
      end

      JSON.parse(response.body)['ok']
    end

    # Check connectivity to chatterbox.
    #
    # Returns nothing, raises StandardError (or a subclass) if there are any
    # issues.
    def self.ping
      response = get('/')
      raise StandardError, "chatterbox returned #{response.code}" unless response.code == '200'
    end

    # Instead of posting to chatterbox, run the specified block.
    # Use for setting up mocks. Colored messages will be passed through as
    # plaintext.
    #
    #  block arg - topic - A String Topic being posted to
    #  block arg - text  - String message being posted to the topic
    #
    # Returns nothing.
    def self.test(&block)
      @test_block = block
    end

    # Disable test mode. Used for chatterbox client tests. Not part of
    # the supported API.
    def self.reset_test
      @test_block = nil
    end

    def self.get(path)
      request = Net::HTTP::Get.new(path)
      request['Content-Type'] = 'application/json'
      send_request(request)
    end

    def self.post(path, data)
      retries = 0
      begin
        request = Net::HTTP::Post.new(path)
        request.body = data.to_json
        request['Content-Type'] = 'application/json'

        send_request(request)
      rescue SocketError => e
        retries += 1
        if retries <= 5
          puts "Error posting to chatterbox: #{e.message}, retrying"
          sleep 1
          retry
        else
          puts "Error posting to chatterbox: #{e.message}, giving up"
          raise e
        end
      end
    end

    # Sends a multipart/form-data request where form_parts is an array of
    # arrays for the parts such as [['upload', File.open('foo.bar')]]
    # see https://www.rubydoc.info/stdlib/net/Net%2FHTTPHeader:set_form
    def self.post_multipart(path, form_parts)
      request = Net::HTTP::Post.new(path)
      request.set_form(form_parts, 'multipart/form-data')
      send_request(request)
    end

    # Issue a request to the chatterbox backend.
    #
    # request :: Net::HTTPGenericRequest subclass
    #            The request to issue.
    #
    # Returns a Net::HTTPResponse subclass or raises one of the Net exceptions.
    def self.send_request(request)
      url = ENV['CHATTERBOX_URL'] || 'https://chatterbox.githubapp.com'
      uri = URI.parse(url)

      auth_token = ENV['CHATTERBOX_TOKEN'] || 'X'
      request.basic_auth(auth_token, 'X')

      http = Net::HTTP.new(uri.host, uri.port)
      http.read_timeout = 5
      http.use_ssl = (uri.scheme == 'https')
      http.request(request)
    end

    # Returns true if a test block has been given.
    def self.test_mode?
      defined?(@test_block) && @test_block
    end

    # Calls back using test block instead of "real" block in test mode
    #
    # Returns nothing
    def self.test_say(topic, message, options)
      @test_block.call topic, message
      return unless attachments = options[:attachments] || options['attachments']

      attachments.each do |attachment|
        ['fallback', :fallback, 'text', :text].each do |field|
          @test_block.call topic, attachment[field] if attachment[field]
        end
      end
    end

    # Calls back using test block instead of "real" block in test mode
    #
    # Returns nothing
    def self.test_upload_say(topic, filename, content, comment)
      @test_block.call topic, filename, content, comment
    end
  end
end
