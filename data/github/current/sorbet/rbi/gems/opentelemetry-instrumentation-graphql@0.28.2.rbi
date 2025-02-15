# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `opentelemetry-instrumentation-graphql` gem.
# Please instead update this file by running `bin/tapioca gem opentelemetry-instrumentation-graphql`.

# OpenTelemetry is an open source observability framework, providing a
# general-purpose API, SDK, and related tools required for the instrumentation
# of cloud-native software, frameworks, and libraries.
#
# The OpenTelemetry module provides global accessors for telemetry objects.
# See the documentation for the `opentelemetry-api` gem for details.
#
# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#9
module OpenTelemetry
  extend ::OpenTelemetry

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#36
  def error_handler; end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#27
  def error_handler=(_arg0); end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#44
  def handle_error(exception: T.unsafe(nil), message: T.unsafe(nil)); end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#30
  def logger; end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#27
  def logger=(_arg0); end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#69
  def propagation; end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#27
  def propagation=(_arg0); end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#64
  def tracer_provider; end

  # source://opentelemetry-api/1.2.5/lib/opentelemetry.rb#52
  def tracer_provider=(provider); end
end

class OpenTelemetry::Error < ::StandardError; end

# Instrumentation should be able to handle the case when the library is not installed on a user's system.
#
# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#10
module OpenTelemetry::Instrumentation
  extend ::OpenTelemetry::Instrumentation

  # source://opentelemetry-registry/0.3.1/lib/opentelemetry/instrumentation.rb#21
  def registry; end
end

# Contains the OpenTelemetry instrumentation for the GraphQL gem
#
# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#11
module OpenTelemetry::Instrumentation::GraphQL; end

# The Instrumentation class contains logic to detect and install the GraphQL instrumentation
class OpenTelemetry::Instrumentation::GraphQL::Instrumentation < ::OpenTelemetry::Instrumentation::Base
  # @return [Boolean]
  #
  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/instrumentation.rb#36
  def supports_legacy_tracer?; end

  # @return [Boolean]
  #
  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/instrumentation.rb#40
  def supports_new_tracer?; end

  private

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/instrumentation.rb#72
  def gem_version; end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/instrumentation.rb#88
  def install_new_tracer(config = T.unsafe(nil)); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/instrumentation.rb#76
  def install_tracer(config = T.unsafe(nil)); end
end

# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#12
module OpenTelemetry::Instrumentation::GraphQL::Tracers; end

# GraphQLTrace contains the OpenTelemetry tracer implementation compatible with
# the new GraphQL tracing API (>= 2.0.18)
#
# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#15
module OpenTelemetry::Instrumentation::GraphQL::Tracers::GraphQLTrace
  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#16
  def initialize(trace_scalars: T.unsafe(nil), **_options); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#91
  def analyze_multiplex(multiplex:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#95
  def analyze_query(query:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#130
  def authorized(query:, type:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#139
  def authorized_lazy(query:, type:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#112
  def execute_field(field:, query:, ast_node:, arguments:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#121
  def execute_field_lazy(field:, query:, ast_node:, arguments:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#62
  def execute_multiplex(multiplex:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#99
  def execute_query(query:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#108
  def execute_query_lazy(query:, multiplex:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#66
  def lex(query_string:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#70
  def parse(query_string:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#147
  def resolve_type(query:, type:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#153
  def resolve_type_lazy(query:, type:, object:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#74
  def validate(query:, validate:, &block); end

  private

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#187
  def _otel_authorized_key(type); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#161
  def _otel_execute_field_key(field:, &block); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#177
  def _otel_field_key(field); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#197
  def _otel_resolve_type_key(type); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#211
  def config; end

  # @return [Boolean]
  #
  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#167
  def trace_field?(field); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_trace.rb#207
  def tracer; end
end

# GraphQLTracer contains the OpenTelemetry tracer implementation compatible with
# the GraphQL tracer API
#
# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#15
class OpenTelemetry::Instrumentation::GraphQL::Tracers::GraphQLTracer < ::GraphQL::Tracing::PlatformTracing
  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#60
  def platform_authorized_key(type); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#50
  def platform_field_key(type, field); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#70
  def platform_resolve_type_key(type); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#29
  def platform_trace(platform_key, key, data); end

  private

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#139
  def attr_cache; end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#90
  def attributes_for(key, data); end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#86
  def config; end

  # source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#82
  def tracer; end
end

# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/tracers/graphql_tracer.rb#16
OpenTelemetry::Instrumentation::GraphQL::Tracers::GraphQLTracer::DEFAULT_HASH = T.let(T.unsafe(nil), Hash)

# source://opentelemetry-instrumentation-graphql//lib/opentelemetry/instrumentation/graphql/version.rb#10
OpenTelemetry::Instrumentation::GraphQL::VERSION = T.let(T.unsafe(nil), String)

module OpenTelemetry::SemanticConventions; end
module OpenTelemetry::SemanticConventions::Resource; end
module OpenTelemetry::SemanticConventions::Trace; end
