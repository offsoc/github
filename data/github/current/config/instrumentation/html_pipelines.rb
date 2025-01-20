# frozen_string_literal: true

HTML_PIPELINE_DATADOG_METRIC_NAMES = {
  "call" => "html_pipeline.filter.call.dist",
  "scan" => "html_pipeline.filter.scan.dist",
  "enabled" => "html_pipeline.filter.enabled.dist",
}

GitHub.subscribe "call_filter.html_pipeline" do |_event, start, ending, transaction_id, payload|
  filter = payload[:filter].split("::").last

  # Republish using a filter-specific event name so that the time spent in this
  # filter will be tracked by GitHub::RequestTimer.
  GitHub.publish("#{filter.underscore}.call_filter.html_pipeline", start, ending, transaction_id, payload)
end

GitHub.subscribe "goomba.warp_pipe.call" do |event|
  pipeline = event.payload[:pipeline]
  duration = event.duration.round(3)
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "call",
    prefix: pipeline.dogstats_key,
    context: pipeline,
    elapsed: duration
  })

  GitHub.dogstats.distribution("html_pipeline.call.dist",
    duration,
    tags: ["pipeline:#{pipeline.dogstats_key}"]
  )
end

GitHub.subscribe "goomba.warp_pipe.async_call" do |event|
  pipeline = event.payload[:pipeline]
  duration = event.duration.round(3)
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "async_call",
    prefix: pipeline.dogstats_key,
    context: pipeline,
    elapsed: duration
  })

  GitHub.dogstats.distribution("html_pipeline.async_call.dist",
    duration,
    tags: ["pipeline:#{pipeline.dogstats_key}"]
  )
end

GitHub.subscribe "goomba.filter.enabled" do |event|
  filter = event.payload[:filter]
  filter_class = filter.is_a?(Class) ? filter : filter.class
  dogstats_key = filter_class.dogstats_key
  filter_tag = GitHub::DatadogTagsCache::HTML_FILTERS[dogstats_key] || "filter:#{dogstats_key}"
  duration = event.duration.round(3)
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "enabled",
    prefix: dogstats_key,
    context: filter_class,
    elapsed: duration
  })

  GitHub.dogstats.distribution("html_pipeline.filter.enabled.dist", duration, tags: [filter_tag])
end

GitHub.subscribe "goomba.filter.scan" do |event|
  filter = event.payload[:filter]
  dogstats_key = filter.class.dogstats_key
  filter_tag = GitHub::DatadogTagsCache::HTML_FILTERS[dogstats_key] || "filter:#{dogstats_key}"
  duration = (event.payload[:duration] || event.duration).round(3)
  extra_tags = event.payload[:extra_tags] || []
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "scan",
    prefix: dogstats_key,
    context: filter,
    elapsed: duration
  })

  GitHub.dogstats.distribution("html_pipeline.filter.scan.dist", duration, tags: [filter_tag].concat(extra_tags))
end

GitHub.subscribe "goomba.filter.call" do |event|
  filter = event.payload[:filter]
  dogstats_key = filter.class.dogstats_key
  filter_tag = GitHub::DatadogTagsCache::HTML_FILTERS[dogstats_key] || "filter:#{dogstats_key}"
  duration = event.duration.round(3)
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "call",
    prefix: dogstats_key,
    context: filter,
    elapsed: duration
  })

  GitHub.dogstats.distribution("html_pipeline.filter.call.dist", duration, tags: [filter_tag])
end

GitHub.subscribe "goomba.document_fragment.to_html" do |event|
  document = event.payload[:document]
  duration = event.duration.round(3)
  GitHub::Goomba::WarpPipeStats.add_event({
    operation: "to_html",
    prefix: document.class.name.demodulize,
    context: document,
    elapsed: duration
  })

  goomba_stats = document.try(:__stats__)
  if !goomba_stats
    GitHub.dogstats.distribution("html_pipeline.goomba.document_fragment.to_html.dist", duration)
    next
  end

  # send stats tracked from Goomba's internals to dogstats
  goomba_stats.each do |name, count, total_duration|
    # parse the class type and operation from the logged event name
    context, _, operation = name.rpartition("#")

    # Goomba logs the total duration and the number of calls for each operation
    # so we can only get an average duration for each operation that's run.
    # We still want to log the total number of calls though in order to have visibility
    # into call counts and to keep percentile calculations relatively accurate
    avg_duration = total_duration / count
    event_name = ""
    tags = []
    operation = operation.downcase

    if context.end_with?("Filter")
      event_name = HTML_PIPELINE_DATADOG_METRIC_NAMES[operation] || "html_pipeline.filter.#{operation}.dist"
      dogstats_key = GitHub::Goomba::Filter.name_to_dogstats_key(context)
      filter_tag = GitHub::DatadogTagsCache::HTML_FILTERS[dogstats_key] || "filter:#{dogstats_key}"
      tags = [filter_tag]
    else
      context = context.underscore

      event_name = if operation == "parse" && context == "document"
        "html_pipeline.goomba.document.parse.dist"
      elsif operation == "sanitize" && context == "document"
        "html_pipeline.goomba.document.sanitize.dist"
      elsif operation == "serialize" && context == "document"
        "html_pipeline.goomba.document.serialize.dist"
      elsif operation == "to_html" && context == "document_fragment"
        "html_pipeline.goomba.document_fragment.to_html.dist"
      else
        "html_pipeline.goomba.#{context}.#{operation}.dist"
      end
    end

    count.times do
      GitHub.dogstats.distribution(event_name, avg_duration, tags: tags)
    end
  end
end
