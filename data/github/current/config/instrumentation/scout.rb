# frozen_string_literal: true

Scout.instrumenter = GitHub.instrumentation_service

GitHub.subscribe "scout.strategy" do |_, start, finish, _event_id, args|
  strategy = args[:strategy].name
                            .sub(/\AScout::(Strategy::)?/, "")
                            .parameterize

  runtime_ms = (finish - start) * 1000
  tags = ["strategy:#{strategy}"]
  GitHub.dogstats.timing("scout.strategy.runtime", runtime_ms, tags: tags)
end

GitHub.subscribe "scout.detection" do |_, _start, _finish, _event_id, args|
  blob = args[:blob]

  # blob is a Scout::LazyBlob. if its @data ivar is non-nil that means
  # scout loaded the blob data from disk.
  if blob.instance_variable_get(:@data)
    tags = ["ext:#{blob.extname}"]
    GitHub.dogstats.increment("scout.blob.load", tags: tags)
    GitHub.dogstats.gauge("scout.blob.size", blob.size, tags: tags)
  end
end

GitHub.subscribe "scout.detected" do |_, start, finish, _event_id, args|
  blob = args[:blob]
  strategy = args[:strategy]
  stacks = args[:stack]

  strategy = strategy.name
                     .sub(/\Ascout::(Strategy::)?/, "")
                     .parameterize

  runtime_ms = (finish - start) * 1000

  tags = ["strategy:#{strategy}"]
  stack_names_tags = stacks ? stacks.map { |stack| "stack:#{stack[:name].parameterize}" } : nil

  tags.concat(stack_names_tags) if stacks

  GitHub.dogstats.timing("scout.detected.runtime", runtime_ms, tags: tags)
end
