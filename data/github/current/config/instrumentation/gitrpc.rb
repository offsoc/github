# frozen_string_literal: true

module GitRPCInstrumentation
  DEFAULT_SAMPLE_RATE = 1

  SAMPLE_RATES = {
    exists: 0.5,
    online: 0.5,
    spawn_git_ro: 0.5,
  }.freeze

  BERT_SAMPLE_RATE = 0.05

  GITRPC_CACHE_SAMPLE_RATE = 0.01

  RPC_STORE_GITRPC = "rpc_store:gitrpc".freeze

  # Utility class to help us generate canonical descriptions for our gitrpc calls.
  class RemoteCallEvent
    attr_reader :name, :type, :argv, :event

    def initialize(*args)
      @event = ActiveSupport::Notifications::Event.new *args

      case @event.payload[:name].to_s
      when "spawn", "spawn_ro"
        @type = "spawn".freeze
        @argv = @event.payload[:args].first
        @name = argv.first
      when "spawn_git", "spawn_git_ro"
        @type = "spawn".freeze
        @name = @event.payload[:args].first
      else
        @type = "call".freeze
        @name = @event.payload[:name]
      end
    end

    def payload
      @event.payload
    end

    def duration
      @event.duration
    end

    def long_name
      @argv || @name
    end

    def rpc_operation
      @event.payload[:name] || "unknown".freeze
    end
  end

  ActiveSupport::Notifications.subscribe "bert_encode.gitrpc" do |*args|
    event = ActiveSupport::Notifications::Event.new *args
    GitHub.dogstats.distribution("rpc.bert.encode.time".freeze, event.duration, tags: [RPC_STORE_GITRPC])
  end

  ActiveSupport::Notifications.subscribe "bert_encode_size.gitrpc" do |*args|
    event = ActiveSupport::Notifications::Event.new *args
    GitHub.dogstats.distribution("rpc.bert.encode.size".freeze, event.payload[:size], tags: [RPC_STORE_GITRPC])
  end

  ActiveSupport::Notifications.subscribe "bert_decode.gitrpc" do |*args|
    event = ActiveSupport::Notifications::Event.new *args
    GitHub.dogstats.distribution("rpc.bert.decode.time".freeze, event.duration, tags: [RPC_STORE_GITRPC])
  end

  ActiveSupport::Notifications.subscribe "bert_decode_size.gitrpc" do |*args|
    event = ActiveSupport::Notifications::Event.new *args
    GitHub.dogstats.distribution("rpc.bert.decode.size".freeze, event.payload[:size], tags: [RPC_STORE_GITRPC])
  end

  ActiveSupport::Notifications.subscribe "bertrpc_send_message.gitrpc" do |*args|
    event = RemoteCallEvent.new *args

    dog_tags = GitRPCLogSubscriber.stats_tags + ["rpc_operation:#{event.rpc_operation}"]

    GitHub.dogstats.distribution(
      "rpc.bert.send_message.dist.time".freeze,
      event.duration,
      tags: dog_tags)

    error_tags = dog_tags.dup

    unless event.payload[:exception].nil?
      exc_name, exc_message = event.payload[:exception]
      case exc_name
      when GitRPC::Failure.name
        error_tags << "error:failure"
      when GitRPC::ObjectMissing.name, GitRPC::InvalidObject.name, GitRPC::NoSuchPath.name, GitRPC::BadRevision.name
        error_tags << "error:not_found"
      when GitRPC::CommandFailed.name
        error_tags << "error:command"
      when GitRPC::CommandBusy.name
        error_tags << "error:busy"
      when BERTRPC::ReadTimeoutError.name, GitRPC::Timeout.name
        error_tags << "error:timeout"
      when BERTRPC::ReadError.name, BERTRPC::ProtocolError.name
        error_tags << "error:network"
      when BERTRPC::ConnectionError.name
        error_tags << "error:connection"
      else
        error_tags << "error:other"
      end

      GitHub.dogstats.increment(
        "rpc.bert.send_message.error".freeze,
        tags: error_tags)
    end

    # The route may be missing if we're using BERTRPC directly, such as in tests.
    unless event.payload[:route].nil?
      route = event.payload[:route]

      # Note that combining `dest_host` with the existing host-specific tags such as `host`, `hypervisor_chassis`,
      # `serial`, etc., will result in an extremely high number of unique tag combinations, which will make Datadog
      # very unhappy. To avoid this:
      #
      #   1. Add these tags to a separate metric rather the ones above. We can't add `dest_host` to the metrics above
      #      because those already have a `host` tag which is in use in multiple dashboards.
      #   2. Disable any tags that are unique to the local host (e.g. `host`, `hypervisor_chassis`, `serial`, etc.)
      #      in Datadog itself for this metric. We can't stop those tags from being added at this point because they
      #      are included by default.
      #
      GitHub.dogstats.increment("rpc.bert.send_message.by_dest", sample_rate: 0.25, tags: error_tags + [
        "dest_host:#{route.fqdn}",
        "dest_dc:#{route.datacenter}"
      ])
    end
  end

  ActiveSupport::Notifications.subscribe "bertrpc_send_message_through_spokesd.gitrpc" do |*args|
    event = RemoteCallEvent.new *args

    dog_tags = GitRPCLogSubscriber.stats_tags + ["rpc_operation:#{event.rpc_operation}"]

    GitHub.dogstats.distribution(
      "rpc.bert.send_message_through_spokesd.time".freeze,
      event.duration,
      tags: dog_tags)

    error_tags = dog_tags.dup

    unless event.payload[:exception].nil?
      exc_name, exc_message = event.payload[:exception]
      case exc_name
      when GitRPC::Failure.name
        error_tags << "error:failure"
      when GitRPC::ObjectMissing.name, GitRPC::InvalidObject.name, GitRPC::NoSuchPath.name, GitRPC::BadRevision.name
        error_tags << "error:not_found"
      when GitRPC::CommandFailed.name
        error_tags << "error:command"
      when GitRPC::CommandBusy.name
        error_tags << "error:busy"
      when BERTRPC::ReadTimeoutError.name, GitRPC::Timeout.name
        error_tags << "error:timeout"
      when BERTRPC::ReadError.name, BERTRPC::ProtocolError.name
        error_tags << "error:network"
      when BERTRPC::ConnectionError.name
        error_tags << "error:connection"
      else
        error_tags << "error:other"
      end

      GitHub.dogstats.increment(
        "rpc.bert.send_message_through_spokesd.error".freeze,
        tags: error_tags)
    end
  end

  ActiveSupport::Notifications.subscribe "spokesd_send_message.gitrpc" do |*args|
    event = RemoteCallEvent.new *args

    dog_tags = GitRPCLogSubscriber.stats_tags + ["rpc_operation:#{event.rpc_operation}"]

    GitHub.dogstats.distribution(
      "rpc.spokesd.send_message.dist.time".freeze,
      event.duration,
      tags: dog_tags)
  end

  ActiveSupport::Notifications.subscribe "bertrpc_send_message.gitrpc" do |*args|
    event = RemoteCallEvent.new *args

    # Some tags should be set at span creation time because they may impact
    # properties like span ids depending on the type of tracer.
    tags = {
      "component" => "gitrpc",
      "gitrpc.type" => event.type,
      "iopromise.async" => !!event.payload[:async],
    }

    if event.payload[:route]
      tags["peer.host"] = event.payload[:route].host
      tags["peer.dc"] = event.payload[:route].datacenter.to_s if event.payload[:route].respond_to? :datacenter
    end

    span = GitHub.tracer.start_span(event.rpc_operation, start_timestamp: event.event.time, kind: :client, attributes: tags)

    if event.payload[:exception]
      exc_name, exc_message = event.payload[:exception]

      span.status = OpenTelemetry::Trace::Status.error(exc_name)
      if [GitRPC::ObjectMissing.name, GitRPC::InvalidObject.name, GitRPC::NoSuchPath.name, GitRPC::BadRevision.name].exclude?(exc_name)
        span.add_event("exception", attributes: { "exception.type" => exc_name, "exception.message" => exc_message })
      end
    end

    span.finish(end_timestamp: event.event.end)
  end

  ActiveSupport::Notifications.subscribe "remote_call.gitrpc" do |*args|
    event = RemoteCallEvent.new *args

    remote_call_dogstats(event)
  end

  %w[gitrpc spokes_adapter].each do |source|
    ActiveSupport::Notifications.subscribe "cache_get.#{source}" do |_name, _started, _ended, _id, payload|
      op = payload[:backend_method] || "unknown"
      result = payload[:cache_result] || "unknown"
      GitHub.dogstats.increment("rpc.git.cache.get".freeze, sample_rate: GITRPC_CACHE_SAMPLE_RATE,
                                tags: ["result:#{result}", "rpc_operation:#{op}", "via:#{source}"])
    end
  end

  ActiveSupport::Notifications.subscribe "cache_get_multi.gitrpc" do |_name, _started, _ended, _id, payload|
    op = payload[:backend_method] || "unknown"
    keys = payload[:keys] || []
    hits = payload[:results] || []
    hit_count = hits.size
    miss_count = keys.size - hit_count
    tags = ["rpc_operation:#{op}"]
    GitHub.dogstats.count("rpc.git.cache.get_multi".freeze, hit_count,  tags: tags + ["result:hit"],  sample_rate: GITRPC_CACHE_SAMPLE_RATE)
    GitHub.dogstats.count("rpc.git.cache.get_multi".freeze, miss_count, tags: tags + ["result:miss"], sample_rate: GITRPC_CACHE_SAMPLE_RATE)
  end

  %w[cache_get_multi cache_get].each do |source|
    ActiveSupport::Notifications.subscribe "#{source}.gitrpc" do |*args|
      event = RemoteCallEvent.new *args

      backend_method = event.payload[:backend_method] || "unknown"

      # Some tags should be set at span creation time because they may impact
      # properties like span ids depending on the type of tracer.
      tags = {
        "component" => "gitrpc",
        "gitrpc.type" => event.type,
        "iopromise.async" => !!event.payload[:async],
        "rpc_operation" => "#{backend_method}",
        "cache_result" => event.payload[:cache_result] || "unknown",
      }

      if event.payload[:route]
        tags["peer.host"] = event.payload[:route].host
        tags["peer.dc"] = event.payload[:route].datacenter.to_s if event.payload[:route].respond_to? :datacenter
      end

      span = GitHub.tracer.start_span("#{source}.gitrpc.#{backend_method}", start_timestamp: event.event.time, kind: :client, attributes: tags)

      if event.payload[:exception]
        exc_name, exc_message = event.payload[:exception]

        span.status = OpenTelemetry::Trace::Status.error(exc_name)
        if [GitRPC::ObjectMissing.name, GitRPC::InvalidObject.name, GitRPC::NoSuchPath.name, GitRPC::BadRevision.name].exclude?(exc_name)
          span.add_event("exception", attributes: { "exception.type" => exc_name, "exception.message" => exc_message })
        end
      end

      span.finish(end_timestamp: event.event.end)
    end
  end

  def self.remote_call_dogstats(call_event)
    sample_rate = SAMPLE_RATES[call_event.rpc_operation] || DEFAULT_SAMPLE_RATE

    dog_tags = GitRPCLogSubscriber.stats_tags + ["rpc_operation:#{call_event.rpc_operation}"]

    if call_event.payload[:exception].nil?
      dog_tags << "success:true"
    else
      dog_tags << "success:false"

      exc_name, exc_message = call_event.payload[:exception]
      case exc_name
      when GitRPC::Failure.name
        dog_tags << "error:failure"
      when GitRPC::ConnectionError.name
        dog_tags << "error:connection"
      when GitRPC::Timeout.name
        dog_tags << "error:timeout"
      when GitRPC::NetworkError.name
        dog_tags << "error:network"
      when GitRPC::NoDataError.name
        dog_tags << "error:nodata"
      when GitRPC::Error.name
        dog_tags << "error:gitrpc"
      when GitHub::DGit::UnroutedError.name, GitHub::DGit::NotFoundError.name
        dog_tags << "error:unrouted"
      when GitHub::DGit::Error.name
        dog_tags << "error:dgit"
      else
        dog_tags << "error:other"
      end

      # Tracking down specific errors with GitRPC can be difficult. We don't
      # want to blow out the cardinality of our metrics by reporting on every
      # error type but sometimes the above categorizations isn't enough.
      #
      # For the exist? call, I'm seeing a pretty constant rate of "error:other"
      # that I can't find the source of. We'll track the details for just this
      # call, at least temporarily.
      if call_event.rpc_operation.to_s == "exist?"
        dog_tags << "errordetail:#{exc_name}"
      end
    end

    GitHub.dogstats.distribution("rpc.git.dist.time".freeze, call_event.duration, tags: dog_tags)
  end

  class Logging < ActiveSupport::LogSubscriber
    COLUMN_FORMAT = "%s (%3.1fms)".freeze

    def remote_call(event)
      write_log(event, "Remote Call".freeze, RED)
    end

    def online_check(event)
      write_log(event, "Online Check".freeze, GREEN)
    end

    attach_to :gitrpc

    private

    # Write a debug message to the Rails log.
    def write_log(event, action_text, color)
      return unless logger.debug?

      log_text = COLUMN_FORMAT % ["GitRPC #{action_text}", event.duration]
      log_text = color(log_text, color, bold: true, underline: true)
      log_text = "  #{log_text}"

      if event.payload.any?
        payload = event.payload
        info = color(payload[:name], bold: true)
        args = payload[:args] || []
        args = decorate_argument_array(args)
        args.map! { |a| color(a.inspect, bold: true) }
        info = "#{info} (#{args.join(', ')})" if args.any?
        log_text = "#{log_text}  #{info}"
      end

      debug log_text
    end

    # Format the elements of array, condensing 40 char SHA1 strings to 8
    # characters.
    def decorate_argument_array(array)
      array.map do |a|
        if a.is_a?(String) && a =~ /\A[0-9a-f]{40}\Z/
          "#{a[0, 8]}"
        elsif a.is_a?(Array)
          decorate_argument_array(a)
        else
          a
        end
      end
    end
  end
end

class GitRPCLogSubscriber < ActiveSupport::LogSubscriber
  class << self
    delegate :rpc_time, :rpc_time=, :rpc_count, :rpc_count=,
      :rpc_calls, :rpc_calls=, :rpc_call_stats, :rpc_call_stats=,
      :tags, :tags=,
      :stats_tags, :stats_tags=,
    to: :collector
  end

  def self.collector
    GitHub::DataCollector::GitRPCInstrumenterCollector.get_instance
  end

  def self.track=(val)
    collector.enabled = val
  end

  def self.with_track(&block)
    prev_enabled = collector.enabled?
    begin
      self.track = true
      block.call
    ensure
      self.track = prev_enabled
    end
  end

  def remote_call(event)
    if self.class.collector.enabled?
      self.class.rpc_calls << EventTrace.new(event.payload[:name], event.duration, event.payload[:args], tags: self.class.tags.dup)
    end

    call_event = GitRPCInstrumentation::RemoteCallEvent.new(event.name, event.time, event.end, event.transaction_id, event.payload)

    stats = self.class.rpc_call_stats[call_event.long_name]
    stats.time += event.duration / 1000.0
    stats.count += 1
    self.class.rpc_time += event.duration / 1000.0
    self.class.rpc_count += 1
  end

  attach_to :gitrpc
end
