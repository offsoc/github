# frozen_string_literal: true

require_relative "../../lib/github/resilient/circuit_breaker/active_tracker"

GitHub.subscribe "resilient.circuit_breaker.allow_request" do |_name, start, ending, _transaction_id, payload|
  if key = payload[:key]
    Resilient::CircuitBreaker::ActiveTracker.instance.increment_circuit_breaker(key.name)

    base_tags = ["key:#{key.name}"]
    base_tags << "force_closed:true" if payload[:force_closed]
    base_tags << "force_open:true" if payload[:force_open]

    GitHub.dogstats.distribution(
      "resilient.circuit_breaker.allow_request.timing",
      (ending - start) * 1_000,
      tags: base_tags
    )

    circuit_breaker      = nil
    resilient_properties = nil
    resilient_metrics    = nil
    begin
      circuit_breaker      = Resilient::CircuitBreaker.get(key)
      resilient_properties = circuit_breaker.properties
      resilient_metrics    = circuit_breaker.properties&.metrics
    rescue => err
      GitHub.logger.error(
        "Getting Resilient::CircuitBreaker metrics",
        {
          "gh.error.class.name": err.class.name,
          "gh.error.class.message": err.message,
        }
      )
    end

    unless resilient_metrics.nil?
      current_error_rate    = resilient_metrics.error_percentage
      current_request_rate  = resilient_metrics.requests

      # These values are what the `Resilient::CircuitBreaker` uses internally, to determine if the circuit breaker should open
      # see: https://github.com/jnunemaker/resilient/blob/v0.4.0/lib/resilient/circuit_breaker.rb#L119C9-L125
      # The circuit breaker will only open if the errors _and_ the request rate have met or exceeded their defined thresholds
      # i.e. if we have the following
      # error_threshold => 20%
      # request_rate    => 30 requests
      # If a window sees 20+% errors, but < 30 requests, the circuit breaker WILL NOT OPEN
      # it is necessary to have 30+ requests before the circuit breaker opens
      # Emitting these additional tags will help us when looking at DataDog to know if we are close to opening or not
      errors_at_threshold   = current_error_rate >= resilient_properties.error_threshold_percentage
      requests_at_threshold = current_request_rate >= resilient_properties.request_volume_threshold

      metric_tags = base_tags.concat([
        "errors_at_threshold:#{errors_at_threshold}",
        "requests_at_threshold:#{requests_at_threshold}"
      ])

      GitHub.dogstats.distribution(
        "resilient.circuit_breaker.request_rate",
        current_request_rate,
        tags: metric_tags
      )

      # Tag the error_percentage metric with single_request:true/false if the
      # request rate is 1, meaning this call to allow_request? is coming after
      # only a single conclusive request in this window. We can tune our
      # monitors based on this tag to filter out relatively infrequent one-off
      # errors.
      single_request_tag = "single_request:#{current_request_rate == 1}"
      metric_tags << single_request_tag
      GitHub.dogstats.distribution(
        "resilient.circuit_breaker.error_percentage",
        current_error_rate,
        tags: metric_tags
      )
    end

    if payload[:result]
      GitHub.dogstats.increment("resilient.circuit_breaker.allowed", tags: base_tags)
    else
      GitHub.dogstats.increment("resilient.circuit_breaker.rejected", tags: base_tags)
    end
  end
end

GitHub.subscribe "resilient.circuit_breaker.open" do |_name, _start, _ending, _transaction_id, payload|
  if key = payload[:key]
    if payload[:result]
      base_tags = ["key:#{key.name}"]
      GitHub.dogstats.increment("resilient.circuit_breaker.open", tags: base_tags)
    end
  end
end

GitHub.subscribe "resilient.circuit_breaker.allow_single_request" do |_name, _start, _ending, _transaction_id, payload|
  if key = payload[:key]
    base_tags = ["key:#{key.name}"]

    if payload[:result]
      GitHub.dogstats.increment("resilient.circuit_breaker.allow_single_request", tags: base_tags)
    else
      GitHub.dogstats.increment("resilient.circuit_breaker.deny_single_request", tags: base_tags)
    end
  end
end

GitHub.subscribe "resilient.circuit_breaker.success" do |_name, _start, _ending, _transaction_id, payload|
  if key = payload[:key]
    base_tags = ["key:#{key.name}"]

    Resilient::CircuitBreaker::ActiveTracker.instance.decrement_active_circuit_breaker(key.name)
    GitHub.dogstats.increment("resilient.circuit_breaker.success", tags: base_tags)

    # this only happens if the circuit was open and mark success closed it;
    # shows us that circuits are correctly being closed
    if payload[:closed_the_circuit]
      GitHub.dogstats.increment("resilient.circuit_breaker.success.closed_the_circuit", tags: base_tags)
    end
  end
end

GitHub.subscribe "resilient.circuit_breaker.failure" do |_name, _start, _ending, _transaction_id, payload|
  if key = payload[:key]
    base_tags = ["key:#{key.name}"]
    circuit_breaker = Resilient::CircuitBreaker.get(key.name)
    Resilient::CircuitBreaker::ActiveTracker.instance.decrement_active_circuit_breaker(key.name)

    GitHub.dogstats.increment("resilient.circuit_breaker.failure", tags: base_tags)

    if circuit_breaker.open
      GitHub.dogstats.increment("resilient.circuit_breaker.failure.kept_the_circuit_open", tags: base_tags)
    end
  end
end
