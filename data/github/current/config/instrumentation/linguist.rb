# typed: true
# frozen_string_literal: true
# frozen_string_literal: true

Linguist.instrumenter = GitHub.instrumentation_service

GitHub.subscribe "linguist.strategy" do |_, start, finish, _event_id, args|
  strategy = args[:strategy].name
    .sub(/\ALinguist::(Strategy::)?/, "")
    .parameterize

  runtime_ms = (finish - start) * 1000
  tags = ["strategy:#{strategy}"]
  GitHub.dogstats.distribution("linguist.strategy.runtime", runtime_ms, tags: tags)
end

GitHub.subscribe "linguist.detection" do |_, _start, _finish, _event_id, args|
  blob = args[:blob]

  # blob is a Linguist::LazyBlob. if its @data ivar is non-nil that means
  # linguist loaded the blob data from disk.
  if blob.instance_variable_get(:@data)
    tags = ["ext:#{blob.extname}"]
    GitHub.dogstats.increment("linguist.blob.load", tags: tags)
    GitHub.dogstats.gauge("linguist.blob.size", blob.size, tags: tags)
  end
end

GitHub.subscribe "linguist.detected" do |_, start, finish, _event_id, args|
  blob = args[:blob]
  strategy = args[:strategy]
  language = args[:language]

  strategy = strategy.name
    .sub(/\ALinguist::(Strategy::)?/, "")
    .parameterize

  runtime_ms = (finish - start) * 1000
  language_name = language ? language.name.parameterize : nil
  tags = [
    "language:#{language_name}",
    "strategy:#{strategy}",
  ]

  GitHub.dogstats.distribution("linguist.detected.runtime", runtime_ms, tags: tags)
end
