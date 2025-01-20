#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true
# Usage: script/graphql_tracing_benchmark -t [all, none, fields] -n [number of times to run each query]
# Runtime pre-requisites:
# 1. bin/server in another terminal to run the required dependency daemons
# 2. bin/graphql_tracing_benchmark.rb -t none -n 1 for quick validation the environment is set up properly

require "benchmark"
require "./config/environment"

unless Rails.env.development?
  abort "This can only be run in development"
end

class GraphQLTracingBenchmark
  VIEWER = User.second

  SMALL_QUERY = <<~QUERY
  query SmallQuery {
    viewer {
      login
    }
  }
  QUERY

  BIG_QUERY = <<~QUERY
  query BigQuery {
    viewer {
      login
      name
      avatarUrl

      repositories(first: 20) {
        edges {
          node {
            name
            parent {
              id
            }
            hasIssuesEnabled
            pushedAt
            issues(first: 20) {
              edges {
                node {
                  title
                  assignees(first: 10) {
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  QUERY

  INTROSPECTION_QUERY = <<~QUERY
  query IntrospectionQuery {
    __schema {

      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description

        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description

    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue


  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
  QUERY

  QUERY_CONTEXT = {
    none: {
      origin: Platform::ORIGIN_API,
      viewer: VIEWER,
    },
    field: {
      origin: Platform::ORIGIN_API,
      viewer: VIEWER,
      gql_field_tracer: true
    }
  }


  def initialize(tracer, n)
    @n = n
    @context = QUERY_CONTEXT[tracer]
    warmup
  end

  def warmup
    5.times do
      Platform.execute(SMALL_QUERY, target: :internal, context: @context)
      Platform.execute(BIG_QUERY, target: :internal, context: @context)
    end
  end

  def run
    Benchmark.bm(20) do |x|
      x.report("small query:") do
        @n.times do
          GitHub::MysqlInstrumenter.reset_stats
          Platform.execute(SMALL_QUERY, target: :internal, context: @context)
        end
      end

      x.report("big query:") do
        @n.times do
          GitHub::MysqlInstrumenter.reset_stats
          Platform.execute(BIG_QUERY, target: :internal, context: @context)
        end
      end

      x.report("introspection query:") do
        @n.times do
          GitHub::MysqlInstrumenter.reset_stats
          Platform.execute(INTROSPECTION_QUERY, target: :internal, context: @context)
        end
      end
    end
  end
end

tracer = T.let(:all, Symbol)
n = T.let(1_000, Integer)
OptionParser.new do |opt|
  opt.banner = "Usage: bin/graphql_tracing_benchmark.rb [options]"
  opt.on("-t [TRACER]", "--tracer [TRACER]", GraphQLTracingBenchmark::QUERY_CONTEXT.keys, "Tracer to profile: [#{GraphQLTracingBenchmark::QUERY_CONTEXT.keys}]") do |t|
    tracer = t
  end


  opt.on("-n [NUM]", "--num [NUM]", Integer, "Number of times to run each query") do |num|
    n = num
  end

  opt.on("-h", "--help", "Prints this help") do
    puts opt
    exit
  end

  opt.parse!(ARGV)
end

if tracer == :all
  GraphQLTracingBenchmark::QUERY_CONTEXT.keys.each do |t|
    puts "=========== PROFILING #{t}"
    GraphQLTracingBenchmark.new(t, n).run
  end
else
  GraphQLTracingBenchmark.new(tracer, n).run
end
