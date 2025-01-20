# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.search_result.click") do |payload|
    message = {
      actor: serializer.user(payload[:client][:user]),
      client_timestamp: payload[:client][:timestamp].try(:to_i),
      server_timestamp: Time.zone.now,
      originating_request_id: payload[:originating_request_id],
      result: payload[:result],
      result_position: payload[:result_position],
      page_number: payload[:page_number],
      per_page: payload[:per_page],
      query: payload[:query],
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
    }

    publish(message, schema: "github.v1.SearchResultClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("search.execute") do |payload|
    if payload[:query]
      message = {
        actor: serializer.user(payload[:actor]),
        query: payload[:query],
        escaped_query: payload[:escaped_query],
        search_type: serializer.search_type(payload[:search_type]),
        search_context: payload[:search_context],
        results: payload[:results],
        total_results: payload[:total_results],
        search_server_took_ms: payload[:search_server_took_ms],
        search_server_timed_out: payload[:search_server_timed_out],
        max_score: payload[:max_score],
        page_number: payload[:page_number],
        per_page: payload[:per_page],
        request_context: serializer.request_context(GitHub.context.to_hash),
        es_query: payload[:es_query],
        originating_request_id: payload[:originating_request_id],
        query_id: payload[:query_id],
      }

      message[:search_scope] = payload[:search_scope].to_s if payload[:search_scope]
      message[:variant] = payload[:variant] if payload[:variant]

      publish(message, schema: "github.v1.Search", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  #### RepositoryChanged event subscriptions (non-analytics events) ####

  # Publish a RepositoryChanged message for Geyser code search indexing.
  # This is the default subcription for all event emit types that are
  # eligible for standard feature flag and repo-status publish gating
  subscribe("search_indexing.repository_changed") do |payload|
    next if GitHub.use_elastomer_code_search?
    next if payload.empty? || payload[:repository].blank?

    repository = payload[:repository]
    lab_scoped = payload[:lab_scoped].present?
    publisher = Search::Blackbird::Publisher.override(payload)

    # bail early if the Repository should not be published
    next unless repository.eligible_for_geyser_ingest?

    # only publish public repos to lab env
    next if lab_scoped && !repository.public?

    # parameterize the target topic by intended Geyser env (lab or production)
    topic = if lab_scoped
      "github.search.v0.LabRepositoryChanged"
    else
      "github.search.v0.RepositoryChanged"
    end

    message = {
      change: payload.fetch(:change, :CHANGE_UNKNOWN),
      repository: serializer.repository(repository),
      owner_name: repository.owner.name,
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
      updated_at: payload.fetch(:updated_at, Time.now.utc),
      old_owner_id: payload.fetch(:old_owner_id, 0),
      target_collections: payload.fetch(:target_collections, []),
      actor: serializer.user(payload.fetch(:actor, nil)),
      owner_feature_flags: [],
      blackbird_experiments: Search::Blackbird.experiments(CopilotIndexedRepositories.find_by(repository_id: repository.id)),
      is_owner_paying_customer: ::BlackbirdSearch::Helpers.repository_owner_is_paying_customer?(repository),
      auth_version: payload.fetch(:auth_version, 0),
    }

    publish(message, schema: "github.search.v0.RepositoryChanged", partition_key: repository.id, topic: topic, publisher: publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # Publish a RepositoryChanged message when a repo is enabled/disabled for Geyser code search indexing
  subscribe("search_indexing.repository_access_changed") do |payload|
    next if GitHub.use_elastomer_code_search?
    next if payload.empty? || payload[:repository].blank?

    repository = payload[:repository]
    lab_scoped = payload[:lab_scoped].present?
    publisher = Search::Blackbird::Publisher.override(payload)

    # bail early if the Repository should not be published
    next unless repository.geyser_indexing_mutable_access_enabled?

    # only publish public repos to lab env
    next if lab_scoped && !repository.public?

    # parameterize the target topic by intended Geyser env (lab or production)
    topic = if lab_scoped
      "github.search.v0.LabRepositoryChanged"
    else
      "github.search.v0.RepositoryChanged"
    end

    message = {
      change: payload.fetch(:change, :CHANGE_UNKNOWN),
      repository: serializer.repository(repository),
      owner_name: repository.owner.name,
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
      updated_at: payload.fetch(:updated_at, Time.now.utc),
      old_owner_id: payload.fetch(:old_owner_id, 0),
      target_collections: payload.fetch(:target_collections, []),
      owner_feature_flags: [],
      blackbird_experiments: Search::Blackbird.experiments(CopilotIndexedRepositories.find_by(repository_id: repository.id)),
      is_owner_paying_customer: ::BlackbirdSearch::Helpers.repository_owner_is_paying_customer?(repository),
    }

    publish(message, schema: "github.search.v0.RepositoryChanged", partition_key: repository.id, topic: topic, publisher: publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # Publish a RepositoryChanged CREATED message for Geyser code search indexing, without typical flag gating
  subscribe("search_indexing.repository_created") do |payload|
    next if GitHub.use_elastomer_code_search?
    next if payload.empty? || payload[:repository].blank?

    repository = payload[:repository]
    lab_scoped = payload[:lab_scoped].present?
    publisher = Search::Blackbird::Publisher.override(payload)

    # bail early if the owner isn't eligible for repo search
    if repository.geyser_denylisted?
      next
    end

    # only publish public repos to lab env
    next if lab_scoped && !repository.public?

    # parameterize the target topic by intended Geyser env (lab or production)
    topic = if lab_scoped
      "github.search.v0.LabRepositoryChanged"
    else
      "github.search.v0.RepositoryChanged"
    end

    message = {
      change: payload.fetch(:change, :CHANGE_UNKNOWN),
      repository: serializer.repository(repository),
      owner_name: repository.owner.name,
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
      updated_at: payload.fetch(:updated_at, Time.now.utc),
      old_owner_id: payload.fetch(:old_owner_id, 0),
      target_collections: payload.fetch(:target_collections, []),
      owner_feature_flags: [],
      blackbird_experiments: Search::Blackbird.experiments(CopilotIndexedRepositories.find_by(repository_id: repository.id)),
      is_owner_paying_customer: ::BlackbirdSearch::Helpers.repository_owner_is_paying_customer?(repository),
    }

    publish(message, schema: "github.search.v0.RepositoryChanged", partition_key: repository.id, topic: topic, publisher: publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # Publish a RepositoryChanged DELETED message without typical gating for Geyser code search
  subscribe("search_indexing.repository_deleted") do |payload|
    next if GitHub.use_elastomer_code_search?
    next if payload.empty?
    next if payload[:repository_id].blank? && payload[:repository].blank?

    repository = if payload[:repository_id].present?
      # For times when the repo has been removed and we no longer have access to it
      Repository.new(id: payload[:repository_id])
    else
      payload[:repository]
    end

    publisher = Search::Blackbird::Publisher.override(payload)

    # parameterize the target topic by intended Geyser env (lab or production)
    topic = if payload[:lab_scoped].present?
      "github.search.v0.LabRepositoryChanged"
    else
      "github.search.v0.RepositoryChanged"
    end

    message = {
      change: payload.fetch(:change, :CHANGE_UNKNOWN),
      repository: serializer.repository(repository),
      ref: payload[:ref]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
      updated_at: payload.fetch(:updated_at, Time.now.utc),
      old_owner_id: payload.fetch(:old_owner_id, 0),
      target_collections: payload.fetch(:target_collections, []),
      blackbird_experiments: Search::Blackbird.experiments(CopilotIndexedRepositories.find_by(repository_id: repository.id)),
      is_owner_paying_customer: ::BlackbirdSearch::Helpers.repository_owner_is_paying_customer?(repository),
      auth_version: payload.fetch(:auth_version, 0),
    }
    message[:owner_name] = repository.owner.name unless repository.owner.nil?

    publish(message, schema: "github.search.v0.RepositoryChanged", partition_key: repository.id, topic: topic, publisher: publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # The number of partitions in the blackbird.v0.BlackbirdOnboard topic.
  # See: https://github.com/github/hydro-schemas/blob/main/topic-configuration/production/potomac/blackbird.yaml
  # IF THE PARTITION COUNT CHANGES, THIS MUST BE UPDATED.
  BLACKBIRD_ONBOARD_PARTITIONS = 32

  subscribe("blackbird.repository.onboard") do |payload|
    next if payload.empty? || payload[:repository].blank?

    repository = payload[:repository]

    message = {
      change: :ADMIN_PUSHED,
      repository: serializer.repository(repository),
      owner_name: repository.owner.name,
      updated_at: payload.fetch(:updated_at, Time.now.utc),
      actor: serializer.user(payload.fetch(:actor, nil)),
      owner_feature_flags: [],
      blackbird_experiments: Search::Blackbird.experiments(CopilotIndexedRepositories.find_by(repository_id: repository.id)),
      is_owner_paying_customer: ::BlackbirdSearch::Helpers.repository_owner_is_paying_customer?(repository),
      blackbird_target_corpus: payload.fetch(:blackbird_target_corpus, nil),
    }

    # NOTE: blackbird-mw also publishes to this topic. To ensure that the messages are routed to the same Kafka
    # partition, we manually set the partition with the same algorithm.
    # See: https://github.com/github/blackbird-mw/blob/8494f037a5b426666eb9f909c26ba4a5a40587c2/internal/types/types.go#L33-L35
    partition = repository.id % BLACKBIRD_ONBOARD_PARTITIONS

    publish(message,
      schema: "github.search.v0.RepositoryChanged",
      partition: partition,
      topic: "blackbird.v0.BlackbirdOnboard",
      publisher: Search::Blackbird::Publisher.override(payload))
  end

  subscribe("search.rate_limit") do |payload|
    context = case payload[:context].to_s.downcase
    when "api", "web"
      payload[:context].to_s.upcase.to_sym
    else
      :NO_CONTEXT
    end

    strategy = case payload[:strategy].to_s.downcase
    when "individual", "grouped"
      payload[:strategy].to_s.upcase.to_sym
    else
      :NO_STRATEGY
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      rate_limiter: payload.fetch(:name),
      limit: payload.fetch(:limit, 0),
      ttl_secs: payload.fetch(:ttl, 0),
      context: context,
      strategy: strategy,
      halted: payload[:halted] == true,
      search_type: payload.fetch(:search_type, nil),
    }

    publish(message, schema: "github.v1.SearchRateLimit", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("blackbird.feedback") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      feedback: payload.fetch(:feedback),
      email: payload[:email],
    }

    publish(message, schema: "github.v1.BlackbirdFeedback")
  end

  # Blackbird prioritizes indexing code for paying customers and orgs that are part of a
  # business (enterprise account).
  def owner_is_paying_customer?(repo)
    repo.owner &&
      (repo.owner.paying_customer? ||
        Business::OrganizationMembership.exists?(organization: repo.owner))
  end
end
