require "failbot"
require "failbot/middleware"

require "rails"
require "rails/railtie"
require "active_support/concern"

module Failbot::Rails
  def self.setup(app_name, default_context={})
    if !app_name.respond_to?(:to_str) || app_name.to_str.empty?
      raise ArgumentError, "app_name argument is required"
    end

    settings = ENV.to_hash

    # sensible defaults
    if ::Rails.env.development? || ::Rails.env.test?
      settings["FAILBOT_BACKEND"] ||= "memory"

      if !settings.key?("FAILBOT_RAISE")
        settings["FAILBOT_RAISE"] = "1"
      end
    end

    Failbot.setup(settings, default_context.merge({:app => app_name.to_str}))
    Failbot.install_unhandled_exception_hook!

    @_setup = true
  end

  def self.reset!
    Failbot.reset!
    @_setup = false
  end

  class << self
    attr_reader :_setup
  end

  class Engine < ::Rails::Railtie
    initializer "failbot_rails.assert_setup" do |app|
      app.config.before_initialize do
        if !::Failbot::Rails._setup
          fail "FailbotRails must be setup like so: FailbotRails.setup(\"my_app\")"
        end
      end
    end

    initializer "failbot_rails.install_middleware" do |app|
      app.middleware.insert_after \
        ::ActionDispatch::DebugExceptions,
        ::Failbot::Rails::Middleware
    end

    initializer "failbot_rails.install_action_controller_utilities" do |app|
      app.config.to_prepare do
        ActiveSupport.on_load(:action_controller) do
          include ::Failbot::Rails::ActionControllerUtilities
        end
      end
    end
  end

  class Middleware < ::Failbot::Rescuer
    def initialize(app)
      @app = app
      @other = {}
    end

    def self.context(env)
      ::Failbot::Rails._failbot_safe_context(super)
    end
  end

  def self._failbot_safe_context(context)
    new_context = {}.merge(context)
    filters = ::Rails.application.config.filter_parameters
    filter = ActiveSupport::ParameterFilter.new(filters)

    if new_context.key?(:params)
      new_context[:params] = filter.filter(new_context[:params])
    end

    new_context
  end

  module ActionControllerUtilities
    extend ActiveSupport::Concern

    included do
      # reset context before populating it with rails-specific info
      before_action :_failbot_rails

      respond_to?(:helper_method) and helper_method :failbot
    end

    private

    def failbot(e, context={})
      if e.kind_of?(ActionView::TemplateError) && e.respond_to?(:original_exception)
        # exceptions raised from views are wrapped in TemplateError. This is the
        # most annoying thing ever.
        e = e.original_exception
      end

      if e.respond_to?(:info) && e.info.is_a?(Hash)
        context = e.info.merge(context || {})
      end

      Failbot.report(e, ::Failbot::Rails._failbot_safe_context(context))
    end

    def _failbot_rails
      context = {
        controller: params[:controller],
        action: params[:action],
      }

      # allow overriding context by defining ApplicationController#failbot_context
      if respond_to?(:failbot_context) && failbot_context.respond_to?(:to_hash)
        context.merge!(failbot_context.to_hash)
      end

      Failbot.push(::Failbot::Rails._failbot_safe_context(context))
    end
  end
end
