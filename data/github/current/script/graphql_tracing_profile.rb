#!/usr/bin/env ruby
# frozen_string_literal: true
# Usage: bin/graphql_tracing_profile.rb --query introspection --tracer field --format json --count 10
# This JSON file can then be downloaded and opened using speedscope.  https://github.com/_speedscope/index.html

# Notes on viewing the flamegraph in code spaces.
# Install the required command via gems: gem install  --user-install stackpro
#

require "optparse"
require "stackprof"
require "./config/environment"

options = {}
small_query = <<~QUERY
query SmallQuery {
  viewer {
    login
  }
}
QUERY

big_query = <<~QUERY
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

introspection_query = <<~QUERY
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

VIEWER = User.second

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

FORMATS = [
  :raw,
  :json,
  :flamegraph
]

MODES = [
  :cpu,
  :wall
]


#Required values
query = nil
output_format = nil

#Optional values
tracer_options = QUERY_CONTEXT.keys + [:all]
context = QUERY_CONTEXT[:none]
#Note this deliberately DOES NOT use an extension. Extensions are added when the results are written to disk.
#Files with multiple extensions (I.E. '.dump.json') fail when loading in speedscope due to a validation bug.
output = "profiles/profile-#{Time.now.utc.iso8601}"
count = 1
profile_mode = MODES.first

options_parser = OptionParser.new do |opt|
  opt.banner = "Usage: bin/graphql_tracing_profile [options]"
  opt.on("--query QUERY", [:small, :big, :introspection], "The query to utilize for benchmarking: [small, big, introspection]") do |input_query|
    if input_query == :small
      query = small_query
    elsif input_query == :big
      query = big_query
    elsif input_query == :introspection
      query = introspection_query
    else
      puts "Invalid input query: #{input_query}"
      exit 1
    end
  end


  opt.on("--format FORMAT", FORMATS, "Which report to use: [#{FORMATS.join(", ")}]") do |f|
    output_format = f
  end

  opt.on("--count [COUNT]", "The count for the number of queries to run") do |input_count|
    count = input_count.to_i
  end

  opt.on("--tracer [TRACER]", tracer_options, "Tracer to profile: [#{tracer_options.join(", ")}]") do |tracer|
    context = QUERY_CONTEXT[tracer]
  end

  opt.on("--output [OUTPUT]", "Where to output the results.") do |out|
    output = out
  end

  opt.on("--mode [MODE]", MODES, "The mode to profile in: [#{MODES.join(", ")}]") do |mode|
    profile_mode = mode
  end


  opt.on("-h", "--help", "Prints this help") do
    puts opt
    exit
  end
end

options_parser.parse!

if query.nil?
  puts "Error: The query argument is required"
  puts options_parser.help
  exit 1
end

if output_format.nil?
  puts "Error: The format argument is required"
  puts options_parser.help
  exit 1
end

def profile(query, mode, count, context, output_format, output)
  puts "========== PROFILING"

  options = { mode: mode, raw: true, interval: 500 }

  profile_data = StackProf.run(**options) do
    count.times do
      Platform.execute(query, target: :internal, context: context)
    end
  end

  report = StackProf::Report.new(profile_data)
  out = StringIO.new

  case output_format
  when :json
    report.print_json(out)
    File.open("#{output}.json", "w") { |f| f.puts(out.string) }
  when :flamegraph
    report.print_d3_flamegraph(out)
    File.open("#{output}-flamegraph.html", "w") { |f| f.puts(out.string) }
  when :raw
    report.print_dump(out)
    File.open("#{output}.stackprof.raw", "w") { |f| f.puts(out.string) }
  else
    report.print_dump(out)
    system "stackprof #{out.string}"
  end

end

# warmup
puts "========== WARMING UP"
5.times do
  Platform.execute(query, target: :internal, context: context || QUERY_CONTEXT[:none])
end

# profile
if context
  profile(query, profile_mode, count, context, output_format, output)
else
  QUERY_CONTEXT.each do |tracer, ctx|
    profile(query, profile_mode, ctx, output_format, "#{output}.#{tracer}")
  end
end
