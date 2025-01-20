# typed: true
# frozen_string_literal: true

require "cache_key_logging_denylist"
require "github/template_tracing"
require "github/template_tracing_renderer"

# Loaded when instrumentation is enabled for the current process to install any
# custom hooks. The file is loaded during Rails's after_initialize hook so
# most classes should be available.
#
# See also: config/initializers/instrumentation.rb

# Instrument Memcached time
class Memcached::Rails
  def self.collector
    GitHub::DataCollector::MemcacheInstrumenterCollector.get_instance
  end

  def self.query_time
    collector.query_time
  end

  def self.query_time=(value)
    collector.query_time = value
  end

  def self.query_count
    collector.query_count
  end

  def self.query_count=(value)
    collector.query_count = value
  end

  def self.query_tracing
    collector.query_tracing
  end

  def self.query_tracing=(value)
    collector.query_tracing = value
  end
end

module Memcached::Rails::WithTiming
  STATS_SAMPLE_RATES = {
    decr: 0.5,
    incr: 0.25,
    get: 0.5,
    # As of 2019-04-03 get_multi is called around 135k times per second on the
    # fe pods and around 500-600k/sec across all environments.  1% sampling is
    # probably more than we need.
    get_multi: 0.01,
    set: 0.5,
    add: 0.5,
    replace: 0.5,
    delete: 0.5,
    prepend: 0.5,
    append: 0.5,
  }.freeze

  [:decr, :incr, :get, :get_multi, :set, :add, :replace, :delete, :prepend, :append].each do |op|
    class_eval <<-RUBY, __FILE__, __LINE__ + 1
      def #{op}(*args, &block)
        if (prev = Memcached::Rails.query_tracing) == false
          Memcached::Rails.query_tracing = true
          start = Time.now
        end
        tags = ["rpc_operation:#{op}"]
        sample_rate = #{STATS_SAMPLE_RATES[op] || 0.5}

        start_time = GitHub::Dogstats.monotonic_time
        begin
          super(*args, &block)
        ensure
          elapsed = GitHub::Dogstats.duration(start_time)

          GitHub.dogstats.distribution("rpc.memcached.dist.time", elapsed, tags: tags)
        end
      ensure
        if prev == false
          Memcached::Rails.query_time += (Time.now-start)
          Memcached::Rails.query_count += 1
          Memcached::Rails.query_tracing = prev
        end
      end
    RUBY
  end
end

Memcached::Rails.send(:prepend, Memcached::Rails::WithTiming)

# Instrument activerecord object instantiation
# This is called for every query so must do as little work as possible
GitHub.subscribe("instantiation.active_record") do |name, _start, _ending, _transaction_id, payload|
  collector = GitHub::DataCollector::MysqlInstrumenterCollector.get_instance
  count = payload[:record_count]
  name = payload[:class_name]
  collector.active_record_obj_count += count
  collector.active_record_obj_types[name] += count
end

class ActionView::Template
  class << self
    attr_accessor :template_trace, :template_trace_enabled
  end

  def self.template_trace_reset
    self.template_trace = GitHub::TemplateTracing.new
  end
  self.template_trace_enabled = false
end

module ActionView::Template::WithTiming
  def render(view, locals, buffer = nil, implicit_locals: [], add_to_stack: true, &block)
    T.bind(self, ActionView::Template)
    if !ActionView::Template.template_trace_enabled
      return super(view, locals, buffer, implicit_locals:, add_to_stack:, &block)
    end

    begin
      ActionView::Template.template_trace.start(virtual_path)
      super(view, locals, buffer, implicit_locals:, add_to_stack:, &block)
    ensure
      ActionView::Template.template_trace.finished(virtual_path)
    end
  end
end

ActionView::Template.send(:prepend, ActionView::Template::WithTiming)

if Rails.env.development? || GitHub.admin_host?
  module ViewComponent::Base::WithTiming
    def render_in(view_context, &block)
      T.bind(self, ViewComponent::Base)
      if !ActionView::Template.template_trace_enabled
        return super(view_context, &block)
      end

      begin
        ActionView::Template.template_trace.start(virtual_path)
        super(view_context, &block)
      ensure
        ActionView::Template.template_trace.finished(virtual_path)
      end
    end
  end

  ViewComponent::Base.send(:prepend, ViewComponent::Base::WithTiming)
end


# Load all subscribers from config/instrumentation/
Dir[Rails.root + "config/instrumentation/*.rb"].each { |l| require l }

# Load all subscribers from packages' config/instrumentation/
Dir[Rails.root + "packages/*/config/instrumentation/*.rb"].each { |l| require l }

HydroLoader.load_github unless GitHub.lazy_load_hydro?
