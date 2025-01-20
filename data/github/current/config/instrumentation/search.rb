# typed: true
# frozen_string_literal: true

ElastomerClient::Notifications.service = GitHub.instrumentation_service

GitHub.subscribe("request.client.elastomer") do |_name, start_time, end_time, _transaction_id, payload|
  status = payload[:status]
  next unless status && status >= 200 && status < 400

  # Audit log queries can sometimes span multiple indices and we need to group
  # it under one common index name for metrics. The regex will ignore individual
  # time series indices we may want to query.
  index = if payload[:index].to_s.start_with?("audit_log")
    Audit::Elastic.metric_index_name(payload[:index])
  else
    payload[:index]
  end
  next if index.nil?

  duration = ((end_time - start_time) * 1000).round
  response_body = payload[:response_body] || {}

  case payload[:action]
  when "docs.search"
    m = /(?:^|&)search_type=([^&]+)/.match payload[:url].query
    search_type = (m && m[1] == "count") ? "count" : "query"

    total = response_body["hits"] && Elastomer::UpgradeShims.get_total_hits(response_body["hits"]) || 0

    # store the search info for staff bar usage
    Elastomer::QueryStats.instance << {
      url: payload[:url],
      body: payload[:request_body],
      time: duration,
      total: total,
      timed_out: response_body["timed_out"],
    }

  when "docs.count"
    total = response_body["count"] || 0

    # store the search info for staff bar usage
    Elastomer::QueryStats.instance << {
      url: payload[:url],
      body: payload[:request_body],
      time: duration,
      total: total,
    }
  end

  action_to_op = {
    "docs.search" => "search",
    "docs.count" => "count",
    "docs.index" => "store",
    "docs.delete" => "remove",
    "docs.delete_by_query" => "remove",
    "bulk" => "bulk",
  }

  if action_to_op.key?(payload[:action])
    tags = [
      "rpc_operation:" + action_to_op[payload[:action]],
      "index:" + index.to_s,
      response_body.key?("timed_out") ? "timed_out:" + response_body["timed_out"].to_s : nil,
      payload.key?(:context) && !payload[:context].nil? ? "context:" + payload[:context].to_s : nil,
    ].compact

    # Hardcoded alias names
    case index.to_s
    when /\Aissues-search/
      index_name = "issues"
    when /\Apackages/
      index_name = "registry-packages"
    when /\Amarketplace-search/
      index_name = "marketplace-listings"
    else
      index_name = index.to_s
    end

    begin
      cluster_name = Elastomer.router.cluster_for_index(index_name)
      # Add cluster tag if it exists
      tags << "cluster:#{cluster_name}"
    rescue Elastomer::UnknownIndex
      GitHub.dogstats.count("elastomer.unknown_index", 1, { tags: ["index:" + index] })
    end

    # note: in this context, not sure overriding logical_service is possible/practical
    resolved_service =
      if index.to_s =~ /code/
        "es_code_search"
      else
        "search_muddle"
      end
    tags << "catalog_service:#{GitHub::ServiceMapping::SERVICE_PREFIX}/#{resolved_service}"

    GitHub.dogstats.timing("rpc.elasticsearch.time", duration, tags: tags)
    GitHub.dogstats.distribution("rpc.elasticsearch.dist.time", duration, tags: tags)

    if payload[:action] == "docs.search" && response_body.key?("took")
      GitHub.dogstats.timing("rpc.elasticsearch.remote.time", response_body["took"], { tags: tags })
    end

    if (retries = payload[:retries].to_i) > 0
      GitHub.dogstats.count("rpc.elasticsearch.retries", retries, { tags: tags })
    end
  end
end
