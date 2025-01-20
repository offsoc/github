# frozen_string_literal: true

require_relative "./errors"
require 'set'

module Authzd
  module Decoratable

    # Wraps the original method into an object that has the middleware spec
    # of responding to .perform.
    #
    class Adapter
      def initialize(receiver, method)
        @receiver = receiver
        @method   = method
      end

      def perform(*args)
        @receiver.send(@method, *args)
      end
    end


    # Decorators can be used to augment the client methods with custom features.
    # A middleware is object that has a `:request` accessor and can forward the
    # execution of `perform` to it. The following is an example of a middleware
    # implementing a read-through cache:
    #
    # ```ruby
    # class Cache
    #   attr_accessor :request
    #
    #   def initialize(cache, ttl)
    #     @cache = cache
    #     @ttl = ttl
    #   end
    #
    #   def perform(*args)
    #     @cache.fetch("authzd:client:v1:#{args.hash}", ttl: @ttl) do
    #       self.request.perform(*args)
    #     end
    #   end
    # end
    # ```
    #
    # You can use it to decorate a method in the Client, with a single middleware:
    #
    # ```ruby
    # authorizer = Authzd::Authorizer::Client.new(SERVER_ADDRESS, timeout: TIMEOUT_IN_SECONDS) do |client|
    #   client.decorate :authorize, with: Cache.new(App.cache, App.config.ttl)
    # end
    # ```
    #
    # Or with a stack of method_middleware that are applied from the left (outermost middleware)
    # to the right (innermost middleware)
    #
    # ```ruby
    # authorizer = Authzd::Authorizer::Client.new(SERVER_ADDRESS, timeout: TIMEOUT_IN_SECONDS) do |client|
    #   client.decorate :authorize, with: [logging, instrumentation, caching]
    # end
    # ```
    # Internally this method, will transform the singleton class (aka eigenclass)
    # of the receiver object converting every decorated method
    # Imagine the following class:
    #
    # class MyClass
    #   def hello(name)
    #     puts "hello #{name}"
    #   end
    #
    #   def self.decoratable_methods
    #     [:foo]
    #   end
    # end
    #
    # When the Decoratable module is included, the class will in memory be transformed
    # into something like this:
    #
    # class MyClass
    #
    #   def original_hello(name)
    #     puts "hello #{name}"
    #   end
    #
    #   def hello(*args)
    #     decorated(:hello).perform(*args)
    #   end
    #
    #   ... Rest of the methods of Decoratable
    # end
    #
    # And `decorated(:hello)`, whill generate an object responding to `:perform`
    # that has all the method_middleware properly composed, and terminated by a wrapper
    # of the original method.
    #
    # In the previous example:
    #
    # ```ruby
    # authorizer = Authzd::Authorizer::Client.new(SERVER_ADDRESS, timeout: TIMEOUT_IN_SECONDS) do |client|
    #   client.decorate :authorize, with: [logging, instrumentation, caching]
    # end
    # ```
    #
    # when we call `authorizer.authorize Request.new` the following set of calls
    # will happen
    #
    # authorizer.authorize(kwargs)
    #  logging logic before decoration
    #  logging.request.perform(kwargs)
    #    instrumentation logic before decoration
    #    instrumentation.request.perform(kwargs)
    #      caching logic before decoration
    #      caching.request.perform(kwargs)
    #        anonymous_object.perform(kwargs)
    #           authorizer.send :original_authorize, kwargs
    #      caching logic after decoration
    #     instrumentation logic after decoration
    #   logging loggic after decoration
    # return result value
    #
    def use(methods, with:)
      methods = Array(methods)

      methods.each do |method|
        register_middleware_for_method(method, with)

        original_method = "original_#{method}"
        unless eigenclass.respond_to?(original_method)
          # original_method has the old implementation
          eigenclass.alias_method original_method, method
          # method now calls perform over the decorated original method
          eigenclass.define_method method do |*args|
            decorated(method).perform(*args)
          end
        end
      end
    end

    def decorate(methods, with:)
        warn("calling decorate is deprecated, please use #use instead.")
        use(methods, with: with)
    end

    private

    # A middleware can be a list of one or more of:
    # - a list containing a middleware class and its initialize args to build
    # a new middleware instance
    # - an instance of a middleware class.
    #
    # This method caches the list of middleware applied to each method in the
    # method_middleware member.
    #
    def register_middleware_for_method(method, middleware_spec)
      raise Authzd::DecorationError, "#{method} is not defined" unless respond_to?(method)
      middleware = []
      middleware_spec = Array(middleware_spec)

      middleware_spec.map do |spec|
        if spec.is_a?(Array) || spec.is_a?(Class)
          middleware << middleware_from_class_and_args(Array(spec))
        else
          middleware << middleware_from_instance(spec)
        end
      end

      method_middleware[method] ||= []
      method_middleware[method] += middleware
    end

    # Parses a middleware from a middleware instance
    def middleware_from_instance(middleware_spec)
      if middleware_used?(middleware_spec)
        raise Authzd::DecorationError, "Cannot use middleware instance more than once: #{middleware_spec}"
      end
      use_middleware!(middleware_spec)
      middleware_spec
    end

    # Parses a middleware from a class and a set of args
    def middleware_from_class_and_args(middleware_spec)
      klass = middleware_spec.shift
      args = middleware_spec
      klass.send(:new, *args)
    rescue => ex
      raise Authzd::DecorationError, "#{ex.message}, while trying to parse middleware from class: #{klass}, and args #{args}"
    end

    # Gets the singleton class of the decoratable instance so methods are
    # overriden only for the particular instance being decorated, and not
    # for all the instance of the class that includes this module
    #
    def eigenclass
      @eigenclass ||= class << self; self; end
    end

    # Composes the decorated version of the original method. And chaches it in memory
    # for future uses.
    #
    def decorated(method)
      decorated_methods[method] ||= begin
        request = Adapter.new(self, "original_#{method}")
        to_decorate = Array(method_middleware[method]) + Array(request)

        outermost = to_decorate[0]
        current = outermost

        (to_decorate[1..-1]).each do |middleware|
          current.request = middleware
          current = current.request
        end

        outermost
      end
    end

    # Hash where keys are method names and values the objects resulting
    # of applying the middleware to the methods. A decorated method is a callable
    # that composes the middleware around the original method.
    #
    # This information can be re-created from @method_middleware, but it´s cached in
    # @decorated_methods for the sake of convenience.
    #
    def decorated_methods
      @decorated_methods ||= {}
    end

    # Hash where keys are the method names and values the list of middleware
    # to apply to the methods being decorated.
    #
    def method_middleware
      @method_middleware ||= {}
    end

    # Caches a middleware instance. This is used to prevent a given instance
    # from decorating more than one decoratable.
    # This is necessary because middleware are stateful: they keep a reference
    # to the next middleware in the chain
    def use_middleware!(middleware)
      @middleware_identities ||= Set.new
      @middleware_identities << middleware.object_id
    end

    # Determines whether a certain middleware instance has already been used
    def middleware_used?(middleware)
      @middleware_identities&.include? middleware.object_id
    end
  end
end
