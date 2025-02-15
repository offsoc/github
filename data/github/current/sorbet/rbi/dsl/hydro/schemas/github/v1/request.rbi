# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Request`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Request`.

class Hydro::Schemas::Github::V1::Request
  sig do
    params(
      actor_name: T.nilable(Google::Protobuf::StringValue),
      analytics_tracking_id: T.nilable(String),
      api_request_owner_id: T.nilable(Google::Protobuf::UInt64Value),
      api_route: T.nilable(Google::Protobuf::StringValue),
      api_version: T.nilable(String),
      auth_fingerprint: T.nilable(Google::Protobuf::StringValue),
      auth_type: T.nilable(T.any(Symbol, Integer)),
      catalog_service: T.nilable(Google::Protobuf::StringValue),
      city: T.nilable(Google::Protobuf::StringValue),
      client_id: T.nilable(Google::Protobuf::StringValue),
      controller: T.nilable(String),
      controller_action: T.nilable(Google::Protobuf::StringValue),
      country_code: T.nilable(Google::Protobuf::StringValue),
      country_name: T.nilable(Google::Protobuf::StringValue),
      cpu_time_ms: T.nilable(Integer),
      current_org: T.nilable(Google::Protobuf::StringValue),
      current_org_id: T.nilable(Google::Protobuf::UInt64Value),
      current_org_is_org: T.nilable(Google::Protobuf::BoolValue),
      current_ref: T.nilable(String),
      current_repo: T.nilable(Google::Protobuf::StringValue),
      current_repo_id: T.nilable(Google::Protobuf::UInt64Value),
      current_repo_visibility: T.nilable(T.any(Symbol, Integer)),
      current_user: T.nilable(Google::Protobuf::StringValue),
      current_user_id: T.nilable(Google::Protobuf::UInt64Value),
      current_user_is_org_member: T.nilable(Google::Protobuf::BoolValue),
      device_cookie: T.nilable(Google::Protobuf::StringValue),
      do_not_track_preference: T.nilable(Google::Protobuf::StringValue),
      elapsed_ms: T.nilable(Integer),
      enqueue_time_ms: T.nilable(Integer),
      enqueue_time_ms_by_backend: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      flipper_checks_count: T.nilable(Integer),
      flipper_features: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::TestedFeature], T::Array[Hydro::Schemas::Github::V1::Entities::TestedFeature])),
      flipper_ms: T.nilable(Integer),
      github_action: T.nilable(Google::Protobuf::StringValue),
      github_controller: T.nilable(Google::Protobuf::StringValue),
      gitrpc_count: T.nilable(Integer),
      gitrpc_time_ms: T.nilable(Integer),
      graphql_accessed_objects: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject], T::Array[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject])),
      graphql_errors: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError], T::Array[Hydro::Schemas::Github::V1::Entities::GraphQLError])),
      host: T.nilable(String),
      http_accept: T.nilable(String),
      http_content_length: T.nilable(Google::Protobuf::UInt32Value),
      http_content_type: T.nilable(String),
      http_method: T.nilable(T.any(Symbol, Integer)),
      http_referrer: T.nilable(Google::Protobuf::StringValue),
      http_status: T.nilable(Integer),
      http_user_agent: T.nilable(String),
      idle_time_ms: T.nilable(Integer),
      integration_id: T.nilable(Google::Protobuf::UInt64Value),
      integration_installation_id: T.nilable(Google::Protobuf::UInt64Value),
      ip_address: T.nilable(String),
      ip_v4_int: T.nilable(Google::Protobuf::UInt32Value),
      ip_v6_int: T.nilable(Google::Protobuf::BytesValue),
      ip_version: T.nilable(T.any(Symbol, Integer)),
      ja3_hash: T.nilable(Google::Protobuf::StringValue),
      jobs_enqueued: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      jobs_enqueued_by_backend: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      kube_cluster: T.nilable(String),
      kube_namespace: T.nilable(String),
      mysql_primary_queries: T.nilable(Integer),
      mysql_queries: T.nilable(Integer),
      mysql_queries_by_cluster: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      mysql_query_types_per_host: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::QueryTypeCount], T::Array[Hydro::Schemas::Github::V1::Request::QueryTypeCount])),
      mysql_read_only_connection: T.nilable(T::Boolean),
      mysql_time_ms: T.nilable(Integer),
      mysql_time_ms_by_cluster: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      oauth_access_id: T.nilable(Google::Protobuf::UInt64Value),
      oauth_application_id: T.nilable(Google::Protobuf::UInt64Value),
      oauth_scopes: T.nilable(Google::Protobuf::StringValue),
      pat_has_sso_access: T.nilable(Google::Protobuf::BoolValue),
      path: T.nilable(String),
      pid: T.nilable(Integer),
      rate_limit: T.nilable(Google::Protobuf::UInt32Value),
      rate_limit_amount: T.nilable(Google::Protobuf::UInt32Value),
      rate_limit_family: T.nilable(Google::Protobuf::StringValue),
      rate_limit_key: T.nilable(Google::Protobuf::StringValue),
      rate_limit_remaining: T.nilable(Google::Protobuf::UInt32Value),
      referrer_action: T.nilable(Google::Protobuf::StringValue),
      referrer_controller: T.nilable(Google::Protobuf::StringValue),
      region: T.nilable(Google::Protobuf::StringValue),
      region_name: T.nilable(Google::Protobuf::StringValue),
      request_category: T.nilable(String),
      request_id: T.nilable(String),
      requested_api_version: T.nilable(String),
      revision: T.nilable(String),
      search_index_additions: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::SearchIndexAddition], T::Array[Hydro::Schemas::Github::V1::Request::SearchIndexAddition])),
      secondary_rate_limit_reason: T.nilable(Google::Protobuf::StringValue),
      selected_api_version: T.nilable(String),
      server: T.nilable(String),
      session_id: T.nilable(Google::Protobuf::UInt32Value),
      tenant_id: T.nilable(Google::Protobuf::StringValue),
      tenant_name: T.nilable(Google::Protobuf::StringValue),
      timed_out: T.nilable(T::Boolean),
      user_programmatic_access_id: T.nilable(Google::Protobuf::Int64Value)
    ).void
  end
  def initialize(actor_name: nil, analytics_tracking_id: nil, api_request_owner_id: nil, api_route: nil, api_version: nil, auth_fingerprint: nil, auth_type: nil, catalog_service: nil, city: nil, client_id: nil, controller: nil, controller_action: nil, country_code: nil, country_name: nil, cpu_time_ms: nil, current_org: nil, current_org_id: nil, current_org_is_org: nil, current_ref: nil, current_repo: nil, current_repo_id: nil, current_repo_visibility: nil, current_user: nil, current_user_id: nil, current_user_is_org_member: nil, device_cookie: nil, do_not_track_preference: nil, elapsed_ms: nil, enqueue_time_ms: nil, enqueue_time_ms_by_backend: T.unsafe(nil), flipper_checks_count: nil, flipper_features: T.unsafe(nil), flipper_ms: nil, github_action: nil, github_controller: nil, gitrpc_count: nil, gitrpc_time_ms: nil, graphql_accessed_objects: T.unsafe(nil), graphql_errors: T.unsafe(nil), host: nil, http_accept: nil, http_content_length: nil, http_content_type: nil, http_method: nil, http_referrer: nil, http_status: nil, http_user_agent: nil, idle_time_ms: nil, integration_id: nil, integration_installation_id: nil, ip_address: nil, ip_v4_int: nil, ip_v6_int: nil, ip_version: nil, ja3_hash: nil, jobs_enqueued: T.unsafe(nil), jobs_enqueued_by_backend: T.unsafe(nil), kube_cluster: nil, kube_namespace: nil, mysql_primary_queries: nil, mysql_queries: nil, mysql_queries_by_cluster: T.unsafe(nil), mysql_query_types_per_host: T.unsafe(nil), mysql_read_only_connection: nil, mysql_time_ms: nil, mysql_time_ms_by_cluster: T.unsafe(nil), oauth_access_id: nil, oauth_application_id: nil, oauth_scopes: nil, pat_has_sso_access: nil, path: nil, pid: nil, rate_limit: nil, rate_limit_amount: nil, rate_limit_family: nil, rate_limit_key: nil, rate_limit_remaining: nil, referrer_action: nil, referrer_controller: nil, region: nil, region_name: nil, request_category: nil, request_id: nil, requested_api_version: nil, revision: nil, search_index_additions: T.unsafe(nil), secondary_rate_limit_reason: nil, selected_api_version: nil, server: nil, session_id: nil, tenant_id: nil, tenant_name: nil, timed_out: nil, user_programmatic_access_id: nil); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def actor_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def actor_name=(value); end

  sig { returns(String) }
  def analytics_tracking_id; end

  sig { params(value: String).void }
  def analytics_tracking_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def api_request_owner_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def api_request_owner_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def api_route; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def api_route=(value); end

  sig { returns(String) }
  def api_version; end

  sig { params(value: String).void }
  def api_version=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def auth_fingerprint; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def auth_fingerprint=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def auth_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def auth_type=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def catalog_service; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def catalog_service=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def city; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def city=(value); end

  sig { void }
  def clear_actor_name; end

  sig { void }
  def clear_analytics_tracking_id; end

  sig { void }
  def clear_api_request_owner_id; end

  sig { void }
  def clear_api_route; end

  sig { void }
  def clear_api_version; end

  sig { void }
  def clear_auth_fingerprint; end

  sig { void }
  def clear_auth_type; end

  sig { void }
  def clear_catalog_service; end

  sig { void }
  def clear_city; end

  sig { void }
  def clear_client_id; end

  sig { void }
  def clear_controller; end

  sig { void }
  def clear_controller_action; end

  sig { void }
  def clear_country_code; end

  sig { void }
  def clear_country_name; end

  sig { void }
  def clear_cpu_time_ms; end

  sig { void }
  def clear_current_org; end

  sig { void }
  def clear_current_org_id; end

  sig { void }
  def clear_current_org_is_org; end

  sig { void }
  def clear_current_ref; end

  sig { void }
  def clear_current_repo; end

  sig { void }
  def clear_current_repo_id; end

  sig { void }
  def clear_current_repo_visibility; end

  sig { void }
  def clear_current_user; end

  sig { void }
  def clear_current_user_id; end

  sig { void }
  def clear_current_user_is_org_member; end

  sig { void }
  def clear_device_cookie; end

  sig { void }
  def clear_do_not_track_preference; end

  sig { void }
  def clear_elapsed_ms; end

  sig { void }
  def clear_enqueue_time_ms; end

  sig { void }
  def clear_enqueue_time_ms_by_backend; end

  sig { void }
  def clear_flipper_checks_count; end

  sig { void }
  def clear_flipper_features; end

  sig { void }
  def clear_flipper_ms; end

  sig { void }
  def clear_github_action; end

  sig { void }
  def clear_github_controller; end

  sig { void }
  def clear_gitrpc_count; end

  sig { void }
  def clear_gitrpc_time_ms; end

  sig { void }
  def clear_graphql_accessed_objects; end

  sig { void }
  def clear_graphql_errors; end

  sig { void }
  def clear_host; end

  sig { void }
  def clear_http_accept; end

  sig { void }
  def clear_http_content_length; end

  sig { void }
  def clear_http_content_type; end

  sig { void }
  def clear_http_method; end

  sig { void }
  def clear_http_referrer; end

  sig { void }
  def clear_http_status; end

  sig { void }
  def clear_http_user_agent; end

  sig { void }
  def clear_idle_time_ms; end

  sig { void }
  def clear_integration_id; end

  sig { void }
  def clear_integration_installation_id; end

  sig { void }
  def clear_ip_address; end

  sig { void }
  def clear_ip_v4_int; end

  sig { void }
  def clear_ip_v6_int; end

  sig { void }
  def clear_ip_version; end

  sig { void }
  def clear_ja3_hash; end

  sig { void }
  def clear_jobs_enqueued; end

  sig { void }
  def clear_jobs_enqueued_by_backend; end

  sig { void }
  def clear_kube_cluster; end

  sig { void }
  def clear_kube_namespace; end

  sig { void }
  def clear_mysql_primary_queries; end

  sig { void }
  def clear_mysql_queries; end

  sig { void }
  def clear_mysql_queries_by_cluster; end

  sig { void }
  def clear_mysql_query_types_per_host; end

  sig { void }
  def clear_mysql_read_only_connection; end

  sig { void }
  def clear_mysql_time_ms; end

  sig { void }
  def clear_mysql_time_ms_by_cluster; end

  sig { void }
  def clear_oauth_access_id; end

  sig { void }
  def clear_oauth_application_id; end

  sig { void }
  def clear_oauth_scopes; end

  sig { void }
  def clear_pat_has_sso_access; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_pid; end

  sig { void }
  def clear_rate_limit; end

  sig { void }
  def clear_rate_limit_amount; end

  sig { void }
  def clear_rate_limit_family; end

  sig { void }
  def clear_rate_limit_key; end

  sig { void }
  def clear_rate_limit_remaining; end

  sig { void }
  def clear_referrer_action; end

  sig { void }
  def clear_referrer_controller; end

  sig { void }
  def clear_region; end

  sig { void }
  def clear_region_name; end

  sig { void }
  def clear_request_category; end

  sig { void }
  def clear_request_id; end

  sig { void }
  def clear_requested_api_version; end

  sig { void }
  def clear_revision; end

  sig { void }
  def clear_search_index_additions; end

  sig { void }
  def clear_secondary_rate_limit_reason; end

  sig { void }
  def clear_selected_api_version; end

  sig { void }
  def clear_server; end

  sig { void }
  def clear_session_id; end

  sig { void }
  def clear_tenant_id; end

  sig { void }
  def clear_tenant_name; end

  sig { void }
  def clear_timed_out; end

  sig { void }
  def clear_user_programmatic_access_id; end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def client_id; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def client_id=(value); end

  sig { returns(String) }
  def controller; end

  sig { params(value: String).void }
  def controller=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def controller_action; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def controller_action=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def country_code; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def country_code=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def country_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def country_name=(value); end

  sig { returns(Integer) }
  def cpu_time_ms; end

  sig { params(value: Integer).void }
  def cpu_time_ms=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def current_org; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def current_org=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def current_org_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def current_org_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def current_org_is_org; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def current_org_is_org=(value); end

  sig { returns(String) }
  def current_ref; end

  sig { params(value: String).void }
  def current_ref=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def current_repo; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def current_repo=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def current_repo_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def current_repo_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def current_repo_visibility; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def current_repo_visibility=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def current_user; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def current_user=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def current_user_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def current_user_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def current_user_is_org_member; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def current_user_is_org_member=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def device_cookie; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def device_cookie=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def do_not_track_preference; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def do_not_track_preference=(value); end

  sig { returns(Integer) }
  def elapsed_ms; end

  sig { params(value: Integer).void }
  def elapsed_ms=(value); end

  sig { returns(Integer) }
  def enqueue_time_ms; end

  sig { params(value: Integer).void }
  def enqueue_time_ms=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def enqueue_time_ms_by_backend; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def enqueue_time_ms_by_backend=(value); end

  sig { returns(Integer) }
  def flipper_checks_count; end

  sig { params(value: Integer).void }
  def flipper_checks_count=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::TestedFeature]) }
  def flipper_features; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::TestedFeature]).void }
  def flipper_features=(value); end

  sig { returns(Integer) }
  def flipper_ms; end

  sig { params(value: Integer).void }
  def flipper_ms=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def github_action; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def github_action=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def github_controller; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def github_controller=(value); end

  sig { returns(Integer) }
  def gitrpc_count; end

  sig { params(value: Integer).void }
  def gitrpc_count=(value); end

  sig { returns(Integer) }
  def gitrpc_time_ms; end

  sig { params(value: Integer).void }
  def gitrpc_time_ms=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject]) }
  def graphql_accessed_objects; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject]
    ).void
  end
  def graphql_accessed_objects=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError]) }
  def graphql_errors; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError]).void }
  def graphql_errors=(value); end

  sig { returns(String) }
  def host; end

  sig { params(value: String).void }
  def host=(value); end

  sig { returns(String) }
  def http_accept; end

  sig { params(value: String).void }
  def http_accept=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def http_content_length; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def http_content_length=(value); end

  sig { returns(String) }
  def http_content_type; end

  sig { params(value: String).void }
  def http_content_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def http_method; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def http_method=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def http_referrer; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def http_referrer=(value); end

  sig { returns(Integer) }
  def http_status; end

  sig { params(value: Integer).void }
  def http_status=(value); end

  sig { returns(String) }
  def http_user_agent; end

  sig { params(value: String).void }
  def http_user_agent=(value); end

  sig { returns(Integer) }
  def idle_time_ms; end

  sig { params(value: Integer).void }
  def idle_time_ms=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def integration_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def integration_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def integration_installation_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def integration_installation_id=(value); end

  sig { returns(String) }
  def ip_address; end

  sig { params(value: String).void }
  def ip_address=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def ip_v4_int; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def ip_v4_int=(value); end

  sig { returns(T.nilable(Google::Protobuf::BytesValue)) }
  def ip_v6_int; end

  sig { params(value: T.nilable(Google::Protobuf::BytesValue)).void }
  def ip_v6_int=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def ip_version; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def ip_version=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def ja3_hash; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def ja3_hash=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def jobs_enqueued; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def jobs_enqueued=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def jobs_enqueued_by_backend; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def jobs_enqueued_by_backend=(value); end

  sig { returns(String) }
  def kube_cluster; end

  sig { params(value: String).void }
  def kube_cluster=(value); end

  sig { returns(String) }
  def kube_namespace; end

  sig { params(value: String).void }
  def kube_namespace=(value); end

  sig { returns(Integer) }
  def mysql_primary_queries; end

  sig { params(value: Integer).void }
  def mysql_primary_queries=(value); end

  sig { returns(Integer) }
  def mysql_queries; end

  sig { params(value: Integer).void }
  def mysql_queries=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def mysql_queries_by_cluster; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def mysql_queries_by_cluster=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::QueryTypeCount]) }
  def mysql_query_types_per_host; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::QueryTypeCount]).void }
  def mysql_query_types_per_host=(value); end

  sig { returns(T::Boolean) }
  def mysql_read_only_connection; end

  sig { params(value: T::Boolean).void }
  def mysql_read_only_connection=(value); end

  sig { returns(Integer) }
  def mysql_time_ms; end

  sig { params(value: Integer).void }
  def mysql_time_ms=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def mysql_time_ms_by_cluster; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def mysql_time_ms_by_cluster=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def oauth_access_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def oauth_access_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt64Value)) }
  def oauth_application_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt64Value)).void }
  def oauth_application_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def oauth_scopes; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def oauth_scopes=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def pat_has_sso_access; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def pat_has_sso_access=(value); end

  sig { returns(String) }
  def path; end

  sig { params(value: String).void }
  def path=(value); end

  sig { returns(Integer) }
  def pid; end

  sig { params(value: Integer).void }
  def pid=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def rate_limit; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def rate_limit=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def rate_limit_amount; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def rate_limit_amount=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def rate_limit_family; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def rate_limit_family=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def rate_limit_key; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def rate_limit_key=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def rate_limit_remaining; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def rate_limit_remaining=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def referrer_action; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def referrer_action=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def referrer_controller; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def referrer_controller=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def region; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def region=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def region_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def region_name=(value); end

  sig { returns(String) }
  def request_category; end

  sig { params(value: String).void }
  def request_category=(value); end

  sig { returns(String) }
  def request_id; end

  sig { params(value: String).void }
  def request_id=(value); end

  sig { returns(String) }
  def requested_api_version; end

  sig { params(value: String).void }
  def requested_api_version=(value); end

  sig { returns(String) }
  def revision; end

  sig { params(value: String).void }
  def revision=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::SearchIndexAddition]) }
  def search_index_additions; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Request::SearchIndexAddition]).void }
  def search_index_additions=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def secondary_rate_limit_reason; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def secondary_rate_limit_reason=(value); end

  sig { returns(String) }
  def selected_api_version; end

  sig { params(value: String).void }
  def selected_api_version=(value); end

  sig { returns(String) }
  def server; end

  sig { params(value: String).void }
  def server=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def session_id; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def session_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def tenant_id; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def tenant_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def tenant_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def tenant_name=(value); end

  sig { returns(T::Boolean) }
  def timed_out; end

  sig { params(value: T::Boolean).void }
  def timed_out=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def user_programmatic_access_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def user_programmatic_access_id=(value); end
end
