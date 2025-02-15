# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::GraphQLQuery`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::GraphQLQuery`.

class Hydro::Schemas::Github::V1::GraphQLQuery
  sig do
    params(
      accessed_objects: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject], T::Array[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject])),
      app: T.nilable(Hydro::Schemas::Github::V1::Entities::App),
      authzd_batch_authorize_count: T.nilable(Integer),
      authzd_batch_authorize_time_ms: T.nilable(Integer),
      complexity_cost: T.nilable(Google::Protobuf::Int32Value),
      cpu_time_ms: T.nilable(Integer),
      dotcom_sha: T.nilable(String),
      elastomer_query_count: T.nilable(Integer),
      elastomer_query_time_ms: T.nilable(Integer),
      errors: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError], T::Array[Hydro::Schemas::Github::V1::Entities::GraphQLError])),
      fetched_node_id_types: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLFetchedNodeIDType], T::Array[Hydro::Schemas::Github::V1::Entities::GraphQLFetchedNodeIDType])),
      gitrpc_count: T.nilable(Integer),
      gitrpc_time_ms: T.nilable(Integer),
      graphql_global_id_type: T.nilable(T.any(Symbol, Integer)),
      graphql_operation_id: T.nilable(String),
      idle_time_ms: T.nilable(Integer),
      integration_installation_value: T.nilable(Hydro::Schemas::Github::V2::Entities::IntegrationInstallation),
      metrics_by_service: T.nilable(T.any(Google::Protobuf::Map[String, Hydro::Schemas::Github::V1::Entities::GraphQLServiceMetric], T::Hash[String, Hydro::Schemas::Github::V1::Entities::GraphQLServiceMetric])),
      mysql_count: T.nilable(Integer),
      mysql_time_ms: T.nilable(Integer),
      node_count: T.nilable(Google::Protobuf::Int32Value),
      operation_type: T.nilable(T.any(Symbol, Integer)),
      origin: T.nilable(T.any(Symbol, Integer)),
      query_byte_size: T.nilable(Integer),
      query_hash: T.nilable(String),
      query_owning_catalog_service: T.nilable(Google::Protobuf::StringValue),
      query_string: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      request_id: T.nilable(String),
      result_byte_size: T.nilable(Google::Protobuf::Int32Value),
      result_hash: T.nilable(Google::Protobuf::StringValue),
      schema_version: T.nilable(String),
      selected_operation: T.nilable(String),
      target: T.nilable(T.any(Symbol, Integer)),
      timed_out: T.nilable(T::Boolean),
      traffic_mirroring: T.nilable(T.any(Symbol, Integer)),
      valid: T.nilable(T::Boolean),
      variables_byte_size: T.nilable(Integer),
      variables_hash: T.nilable(String),
      viewer: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(accessed_objects: T.unsafe(nil), app: nil, authzd_batch_authorize_count: nil, authzd_batch_authorize_time_ms: nil, complexity_cost: nil, cpu_time_ms: nil, dotcom_sha: nil, elastomer_query_count: nil, elastomer_query_time_ms: nil, errors: T.unsafe(nil), fetched_node_id_types: T.unsafe(nil), gitrpc_count: nil, gitrpc_time_ms: nil, graphql_global_id_type: nil, graphql_operation_id: nil, idle_time_ms: nil, integration_installation_value: nil, metrics_by_service: T.unsafe(nil), mysql_count: nil, mysql_time_ms: nil, node_count: nil, operation_type: nil, origin: nil, query_byte_size: nil, query_hash: nil, query_owning_catalog_service: nil, query_string: nil, request_context: nil, request_id: nil, result_byte_size: nil, result_hash: nil, schema_version: nil, selected_operation: nil, target: nil, timed_out: nil, traffic_mirroring: nil, valid: nil, variables_byte_size: nil, variables_hash: nil, viewer: nil); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject]) }
  def accessed_objects; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLAccessedObject]
    ).void
  end
  def accessed_objects=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::App)) }
  def app; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::App)).void }
  def app=(value); end

  sig { returns(Integer) }
  def authzd_batch_authorize_count; end

  sig { params(value: Integer).void }
  def authzd_batch_authorize_count=(value); end

  sig { returns(Integer) }
  def authzd_batch_authorize_time_ms; end

  sig { params(value: Integer).void }
  def authzd_batch_authorize_time_ms=(value); end

  sig { void }
  def clear_accessed_objects; end

  sig { void }
  def clear_app; end

  sig { void }
  def clear_authzd_batch_authorize_count; end

  sig { void }
  def clear_authzd_batch_authorize_time_ms; end

  sig { void }
  def clear_complexity_cost; end

  sig { void }
  def clear_cpu_time_ms; end

  sig { void }
  def clear_dotcom_sha; end

  sig { void }
  def clear_elastomer_query_count; end

  sig { void }
  def clear_elastomer_query_time_ms; end

  sig { void }
  def clear_errors; end

  sig { void }
  def clear_fetched_node_id_types; end

  sig { void }
  def clear_gitrpc_count; end

  sig { void }
  def clear_gitrpc_time_ms; end

  sig { void }
  def clear_graphql_global_id_type; end

  sig { void }
  def clear_graphql_operation_id; end

  sig { void }
  def clear_idle_time_ms; end

  sig { void }
  def clear_integration_installation_value; end

  sig { void }
  def clear_metrics_by_service; end

  sig { void }
  def clear_mysql_count; end

  sig { void }
  def clear_mysql_time_ms; end

  sig { void }
  def clear_node_count; end

  sig { void }
  def clear_operation_type; end

  sig { void }
  def clear_origin; end

  sig { void }
  def clear_query_byte_size; end

  sig { void }
  def clear_query_hash; end

  sig { void }
  def clear_query_owning_catalog_service; end

  sig { void }
  def clear_query_string; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_request_id; end

  sig { void }
  def clear_result_byte_size; end

  sig { void }
  def clear_result_hash; end

  sig { void }
  def clear_schema_version; end

  sig { void }
  def clear_selected_operation; end

  sig { void }
  def clear_target; end

  sig { void }
  def clear_timed_out; end

  sig { void }
  def clear_traffic_mirroring; end

  sig { void }
  def clear_valid; end

  sig { void }
  def clear_variables_byte_size; end

  sig { void }
  def clear_variables_hash; end

  sig { void }
  def clear_viewer; end

  sig { returns(T.nilable(Google::Protobuf::Int32Value)) }
  def complexity_cost; end

  sig { params(value: T.nilable(Google::Protobuf::Int32Value)).void }
  def complexity_cost=(value); end

  sig { returns(Integer) }
  def cpu_time_ms; end

  sig { params(value: Integer).void }
  def cpu_time_ms=(value); end

  sig { returns(String) }
  def dotcom_sha; end

  sig { params(value: String).void }
  def dotcom_sha=(value); end

  sig { returns(Integer) }
  def elastomer_query_count; end

  sig { params(value: Integer).void }
  def elastomer_query_count=(value); end

  sig { returns(Integer) }
  def elastomer_query_time_ms; end

  sig { params(value: Integer).void }
  def elastomer_query_time_ms=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError]) }
  def errors; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLError]).void }
  def errors=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLFetchedNodeIDType]) }
  def fetched_node_id_types; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::GraphQLFetchedNodeIDType]
    ).void
  end
  def fetched_node_id_types=(value); end

  sig { returns(Integer) }
  def gitrpc_count; end

  sig { params(value: Integer).void }
  def gitrpc_count=(value); end

  sig { returns(Integer) }
  def gitrpc_time_ms; end

  sig { params(value: Integer).void }
  def gitrpc_time_ms=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def graphql_global_id_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def graphql_global_id_type=(value); end

  sig { returns(String) }
  def graphql_operation_id; end

  sig { params(value: String).void }
  def graphql_operation_id=(value); end

  sig { returns(Integer) }
  def idle_time_ms; end

  sig { params(value: Integer).void }
  def idle_time_ms=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::IntegrationInstallation)) }
  def integration_installation_value; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::IntegrationInstallation)).void }
  def integration_installation_value=(value); end

  sig { returns(Google::Protobuf::Map[String, Hydro::Schemas::Github::V1::Entities::GraphQLServiceMetric]) }
  def metrics_by_service; end

  sig { params(value: Google::Protobuf::Map[String, Hydro::Schemas::Github::V1::Entities::GraphQLServiceMetric]).void }
  def metrics_by_service=(value); end

  sig { returns(Integer) }
  def mysql_count; end

  sig { params(value: Integer).void }
  def mysql_count=(value); end

  sig { returns(Integer) }
  def mysql_time_ms; end

  sig { params(value: Integer).void }
  def mysql_time_ms=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int32Value)) }
  def node_count; end

  sig { params(value: T.nilable(Google::Protobuf::Int32Value)).void }
  def node_count=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def operation_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def operation_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def origin; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def origin=(value); end

  sig { returns(Integer) }
  def query_byte_size; end

  sig { params(value: Integer).void }
  def query_byte_size=(value); end

  sig { returns(String) }
  def query_hash; end

  sig { params(value: String).void }
  def query_hash=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def query_owning_catalog_service; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def query_owning_catalog_service=(value); end

  sig { returns(String) }
  def query_string; end

  sig { params(value: String).void }
  def query_string=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(String) }
  def request_id; end

  sig { params(value: String).void }
  def request_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int32Value)) }
  def result_byte_size; end

  sig { params(value: T.nilable(Google::Protobuf::Int32Value)).void }
  def result_byte_size=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_hash; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_hash=(value); end

  sig { returns(String) }
  def schema_version; end

  sig { params(value: String).void }
  def schema_version=(value); end

  sig { returns(String) }
  def selected_operation; end

  sig { params(value: String).void }
  def selected_operation=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def target; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def target=(value); end

  sig { returns(T::Boolean) }
  def timed_out; end

  sig { params(value: T::Boolean).void }
  def timed_out=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def traffic_mirroring; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def traffic_mirroring=(value); end

  sig { returns(T::Boolean) }
  def valid; end

  sig { params(value: T::Boolean).void }
  def valid=(value); end

  sig { returns(Integer) }
  def variables_byte_size; end

  sig { params(value: Integer).void }
  def variables_byte_size=(value); end

  sig { returns(String) }
  def variables_hash; end

  sig { params(value: String).void }
  def variables_hash=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def viewer; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def viewer=(value); end
end
