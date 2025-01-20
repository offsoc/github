# typed: true
# frozen_string_literal: true

module AuthzdInstrumentation
  extend self
  include Kernel

  # List of PII attributes to be filtered out of the authzd payload before sending to Failbot.
  # alphabetize this list
  AUTHZD_PII = [
    :actor_ip,
    :user_biztools_user,
    :user_site_admin,
    :user_staff_unlock,
  ]

  # given an authzd request and its response, logs error conditions
  # all errors are logged, and all (with a few exceptions) are reported to the exception tracker
  # if not error is present, it's a no-op
  def log_error(request, response)
    ex = response.error? ? response.error : nil
    if ex.nil? && fetch_not_applicables(response).any?
      ex = Authzd::NotApplicableError.new
      ex.set_backtrace(caller)
    end
    return unless ex

    formated_attrs = formatted_request_attrs(request)
    # we don't want to serialize the whole BatchResponse, so we do this trick to exclude other fields of the class
    response_as_json = (response.try(:responses) || response).as_json
    Failbot.report!(ex, app: "github-authzd", "gh.authzd.request.attributes": formated_attrs, "gh.authzd.decisions": response_as_json) if log_to_failbot?(ex.class)
    rpc = request.batch? ? "batch_authorize" : "authorize"
    GitHub.logger.error({ :exception => ex, "gh.authzd.rpc" => rpc, "gh.authzd.request.attributes" => formated_attrs, "gh.authzd.decisions" => response_as_json })
  end

  # Internal: Emit a DataDog increment metric for every request inside a batch.
  # The action of each request is added as a tag.
  # Because each request was made within a batch, the `batched:true` tag is added.
  #
  # - event: String representing the event to emit
  # - responses: a Hash of {Authzd::Proto::Request => Authzd::Response}
  #
  # Returns nil
  def counter_for_individual_requests(event, responses)
    responses.each do |req, res|
      individual_tags = ["batched:true", "client:github/github"]
      individual_tags << "result:#{res.result}"
      individual_tags << "error_type:#{res.error.class.name}" if res.error?
      individual_tags << "action:#{action_from_request(req)}"

      GitHub.dogstats.increment(event, tags: individual_tags)
    end
  end

  # Internal: Emit a DataDog distribution metric for every request inside a batch.
  # The action of each request is added as a tag.
  # Because each request was made within a batch, the `batched:true` tag is added.
  #
  # - event: String representing the event to emit
  # - value: Numeric value of the distribution
  # - responses: a Hash of {Authzd::Proto::Request => Authzd::Response}
  #
  # Returns nil
  def distribution_for_individual_requests(event, value, responses)
    responses.each do |req, res|
      individual_tags = ["batched:true", "client:github/github"]
      individual_tags << "error_type:#{res.error.class.name}" if res.error?
      individual_tags << "action:#{action_from_request(req)}"

      GitHub.dogstats.distribution(event, value, tags: individual_tags)
    end
  end

  # Send data to Datadog for an Enumerator Authzd request - works for both the for_subject
  # and for_actor requests.
  def instrument_enumerator_request(start, ending, payload)
    tags = ["client:github/github", "rpc:#{payload[:operation]}"]
    if payload[:response].nil?
      tags << "error_type:Unknown"
    elsif payload[:response].error.present?
      tags << "error_type:#{payload[:response].error.class.name}"
    end
    tags << tags_from_enumeration_request(payload[:authz_request])

    # TODO: update log_error method to handle errors from enumerator client -
    # https://github.com/github/authorization/issues/2471
    # log_error(payload[:authz_request], payload[:response])
    duration = (ending - start) * 1_000 # ms
    GitHub.dogstats.distribution("authzd.client.enumerator.request.dist", duration, tags: tags.flatten)
    GitHub.dogstats.increment("authzd.client.enumerator.request.count", tags: tags.flatten)
  end

  # If an exception is listed here, it won't be sent to Failbot, but will always be sent to the log
  # The reasoning is those are not-actionable and usually cause noise in our exception tracker
  FAILBOT_IGNORED_EXCEPTIONS = [Faraday::TimeoutError, Authzd::Middleware::CircuitBreaker::CircuitOpenError]

  # Returns true if an exception should be sent to our exception tracker, false otherwise
  def log_to_failbot?(exception_class)
    FAILBOT_IGNORED_EXCEPTIONS.exclude?(exception_class)
  end

  # Returns a hash of authzd request attributes with PII filtered out.
  # supports both invidual requests and batched requests
  def formatted_request_attrs(req)
    # get requests in batch, or the individual request
    requests = req.try(:requests) || Array(req)

    requests.each_with_object([]) do |single_request, array|
      formatted_attrs = single_request.attributes.each_with_object({}) do |authz_attr, hsh|
        formatted_key = formatted_key(authz_attr.id)
        if AUTHZD_PII.include?(formatted_key)
          hsh[formatted_key] = GitHub::Config::SANITIZED_VALUE
        else
          hsh[formatted_key] = authz_attr.value&.unwrap
        end
      end
      array << formatted_attrs
    end
  end

  # Extract the action attribute from a request.
  # If no action is found, "UNKNOWN" is returned.
  #
  # - req: an Authzd::Proto::Request
  #
  # Returns a String
  def action_from_request(req)
    return "UNKNOWN" if req.nil?

    action_attribute = req.attributes.find { |a| a.id == "action" }
    return "UNKNOWN" if action_attribute.nil?

    action_attribute.unwrapped_value
  end

  # Extracts the tags that we send to Datadog for Enumerator requests. The following tags
  # are extracted for both ForSubject and ForActor requests:
  #  - actor_type
  #  - subject_type
  #  - relationship
  #  - scope
  #
  # Note: we do not record actor_id or subject_id, since we don't want to send unbounded tag
  # values to Datadog (because: $).
  #
  # - req: an enumeration request
  #       (Authzd::Enumerator::ForSubjectRequest or Authzd::Enumerator::ForActorRequest)
  #
  # Returns an Array of tags
  def tags_from_enumeration_request(req)
    return [] if req.nil?
    return [] unless req.is_a?(Authzd::Enumerator::ForSubjectRequest) ||
                    req.is_a?(Authzd::Enumerator::ForActorRequest)

    [
      "actor_type:#{req.actor_type}",
      "subject_type:#{req.subject_type}",
      "relationship:#{T.must(req.options).relationship}",
      "scope:#{T.must(req.options).scope}"
    ]
  end

  def formatted_key(name)
    name.split(".").join("_").to_sym
  end

  def fetch_not_applicables(response)
    return response.decisions.select { |response| response.not_applicable? } if response.try(:batch?)
    return [response] if response.not_applicable?
    []
  end
end

GitHub.subscribe "authzd.client.timing.authorize" do |_event, start, ending, _transaction_id, payload|
  duration = (ending - start) * 1_000 # ms
  action_attribute = AuthzdInstrumentation.action_from_request(payload[:authz_request])

  tags = ["batched:false", "client:github/github", "rpc:#{payload[:operation]}"]
  if payload[:response].error?
    tags << "error_type:#{payload[:response].error.class.name}"
  end
  tags << "action:#{action_attribute}"

  GitHub.dogstats.distribution("authzd.client.timing", duration, tags: tags)

  if GitHub::AuthzdInstrumenter.enabled?
    GitHub::AuthzdInstrumenter.track_authorize(action: action_attribute, duration_ms: duration)
  end
end

GitHub.subscribe "authzd.client.timing.batch_authorize" do |_event, start, ending, _transaction_id, payload|
  duration = (ending - start) * 1_000 # ms
  metric_name = "authzd.client.timing"

  tags = ["batched:true", "client:github/github", "rpc:#{payload[:operation]}"]
  tags << "error_type:#{payload[:response].error.class.name}" if payload[:response].error?

  GitHub.dogstats.distribution(metric_name, duration, tags: tags)

  # We chose to assign the duration of the batch to each individual request inside the batch. Our reasoning being that,
  # from the client's perspective when looking at a request inside the batch, each individual request took that amount of time to complete.
  AuthzdInstrumentation.distribution_for_individual_requests(metric_name, duration, payload[:response].map)

  if GitHub::AuthzdInstrumenter.enabled?
    actions = payload[:response].requests.map do |req|
      AuthzdInstrumentation.action_from_request(req)
    end
    GitHub::AuthzdInstrumenter.track_batch_authorize({ actions: actions, duration_ms: duration })
  end
end

GitHub.subscribe "authzd.client.timing.for_subject" do |_event, start, ending, _transaction_id, payload|
  AuthzdInstrumentation.instrument_enumerator_request(start, ending, payload)
end

GitHub.subscribe "authzd.client.timing.for_actor" do |_event, start, ending, _transaction_id, payload|
  AuthzdInstrumentation.instrument_enumerator_request(start, ending, payload)
end

GitHub.subscribe "authzd.client.request.authorize" do |_event, _start, _ending, _transaction_id, payload|
  action_attribute = AuthzdInstrumentation.action_from_request(payload[:authz_request])
  tags = ["batched:false", "client:github/github", "rpc:authorize"]
  tags << "error_type:#{payload[:response].error.class.name}" if payload[:response].error?
  tags << "result:#{payload[:response].result}"
  tags << "action:#{action_attribute}"

  AuthzdInstrumentation.log_error(payload[:authz_request], payload[:response])
  GitHub.dogstats.increment("authzd.client.request", tags: tags)
end

GitHub.subscribe "authzd.client.request.batch_authorize" do |_event, _start, _ending, _transaction_id, payload|
  metric_name = "authzd.client.request"
  tags = ["client:github/github", "rpc:batch_authorize"]
  tags << "error_type:#{payload[:error].class.name}" if payload[:error]

  AuthzdInstrumentation.log_error(payload[:authz_request], payload[:response])
  GitHub.dogstats.increment(metric_name, tags: tags)

  AuthzdInstrumentation.counter_for_individual_requests(metric_name, payload[:response].map)
end

GitHub.subscribe "authzd.client.retry.failed" do |_event, _start, _ending, _transaction_id, payload|
  error_type = payload[:error].class.name
  GitHub.dogstats.increment("authzd.client.retry", tags: ["attempt:%{attempt}" % payload,
                                                   "error_type:#{error_type}",
                                                   "rpc:%{rpc}" % payload,
                                                   "status:failed",
                                                   "client:github/github"])
end

GitHub.subscribe "authzd.client.retry.succeeded" do |_event, _start, _ending, _transaction_id, payload|
  GitHub.dogstats.increment("authzd.client.retry", tags: ["attempt:%{attempt}" % payload,
                                                   "status:success",
                                                   "client:github/github",
                                                   "rpc:%{rpc}" % payload])
end

GitHub.subscribe "authzd.client.retry.waited" do |_event, _start, _ending, _transaction_id, payload|
  error_type = payload[:error].class.name
  GitHub.dogstats.increment("authzd.client.retry.waited", tags: ["attempt:%{attempt}" % payload,
                                                                     "error_type:#{error_type}",
                                                                     "wait_seconds:%{wait_seconds}" % payload,
                                                                     "client:github/github",
                                                                     "rpc:%{rpc}" % payload])
end

GitHub.subscribe "authzd.client.circuit_breaker.open" do |*_args|
  GitHub.dogstats.increment("authzd.client.circuit_breaker", tags: ["state:open", "client:github/github"])
end

GitHub.subscribe "authzd.client.circuit_breaker.success" do |*_args|
  GitHub.dogstats.increment("authzd.client.circuit_breaker", tags: ["state:success", "client:github/github"])
end

GitHub.subscribe "authzd.client.circuit_breaker.failure" do |_event, _start, _ending, _transaction_id, payload|
  error_type = payload[:error].class.name
  GitHub.dogstats.increment("authzd.client.circuit_breaker", tags: ["state:failure",
                                                             "error_type:#{error_type}",
                                                             "client:github/github"])
end
