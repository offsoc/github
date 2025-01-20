# frozen_string_literal: true

require "set"
require_relative "../errors"

module Authnd
  module Client
    module Decoratable
      # Wraps the original method into an object that has the middleware spec
      # of responding to .perform.
      #
      class Adapter
        attr_reader :method_name

        def initialize(receiver, method, method_name)
          @receiver = receiver
          @method   = method
          @method_name = method_name
        end

        def perform(*args, **kwargs)
          @receiver.send(@method, *args, **kwargs)
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
      #   def perform(*args, **kwargs)
      #     @cache.fetch("authnd:client:v1:#{args.hash}", ttl: @ttl) do
      #       self.request.perform(*args, **kwargs)
      #     end
      #   end
      # end
      # ```
      #
      # You can use it to decorate a method in the Client, with a single middleware:
      #
      # ```ruby
      # authenticator = Authnd::Client::Authenticator.new(faraday_conn) do |client|
      #   client.use :authenticate, with: Cache.new(App.cache, App.config.ttl)
      # end
      # ```
      #
      # Or with a stack of method_middleware that are applied from the left (outermost middleware)
      # to the right (innermost middleware)
      #
      # ```ruby
      # authenticator = Authnd::Client::Authenticator.new(faraday_conn) do |client|
      #   client.use :authenticate, with: [logging, instrumentation, caching]
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
      #   def hello(*args, **kwargs)
      #     decorated(:hello).perform(*args, **kwargs)
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
      # authenticator = Authnd::Client::Authenticator.new(faraday_conn) do |client|
      #   client.use :authenticate, with: [logging, instrumentation, caching]
      # end
      # ```
      #
      # when we call `authenticator.authenticate Request.new` the following set of calls
      # will happen
      #
      # authenticator.authenticate(kwargs)
      #  logging logic before decoration
      #  logging.request.perform(kwargs)
      #    instrumentation logic before decoration
      #    instrumentation.request.perform(kwargs)
      #      caching logic before decoration
      #      caching.request.perform(kwargs)
      #        anonymous_object.perform(kwargs)
      #           authenticator.send :original_authenticate, kwargs
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
          next if eigenclass.respond_to?(original_method)

          # original_method has the old implementation
          eigenclass.alias_method original_method, method
          # method now calls perform over the decorated original method
          eigenclass.define_method method do |*args, **kwargs|
            decorated(method).perform(*args, **kwargs)
          end
        end
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
        raise Authnd::DecorationError, "#{method} is not defined" unless respond_to?(method)

        middleware = []
        middleware_spec = Array(middleware_spec)

        middleware_spec.map do |spec|
          middleware << if spec.is_a?(Array) || spec.is_a?(Class)
                          middleware_from_class_and_args(Array(spec))
                        else
                          middleware_from_instance(spec)
                        end
        end

        method_middleware[method] ||= []
        method_middleware[method] += middleware
      end

      # Parses a middleware from a middleware instance
      def middleware_from_instance(middleware_spec)
        raise Authnd::DecorationError, "Cannot use middleware instance more than once: #{middleware_spec}" if middleware_used?(middleware_spec)

        use_middleware!(middleware_spec)
        middleware_spec
      end

      # Parses a middleware from a class and a set of args
      def middleware_from_class_and_args(middleware_spec)
        klass = middleware_spec[0]
        kwargs = middleware_spec[1] || {}
        klass.send(:new, **kwargs)
      rescue StandardError => e
        raise Authnd::DecorationError, "#{e.message}, while trying to parse middleware from class: #{klass}, and kwargs #{kwargs}"
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
          request = Adapter.new(self, "original_#{method}", method.to_s)
          to_decorate = Array(method_middleware[method]) + Array(request)

          outermost = to_decorate[0]
          innermost = to_decorate.last
          current = outermost

          (to_decorate[1..]).each do |middleware|
            current.original_method_name = innermost.method_name
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
      # This information can be re-created from @method_middleware, but it's cached in
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
end
