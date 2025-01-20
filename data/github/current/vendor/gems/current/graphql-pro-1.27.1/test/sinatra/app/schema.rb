# frozen_string_literal: true
require "graphql/enterprise"

module App
  # Type system:
  Definition = <<-GRAPHQL
    type Subscription {
      counterIncremented(id: ID!): Counter
    }
    type Counter {
      id: ID!
      value: Int!
    }
    type Query {
      counter(id: ID!): Counter
    }
    type Mutation {
      incrementCounter(id: ID!): Counter
    }
  GRAPHQL

  # Resolve functions:
  Resolvers = {
    "Subscription" => {
      "counterIncremented" => ->(o, a, c) {
        if c.query.subscription_update?
          o
        else
          c.skip
        end
      }
    },
    "Mutation" => {
      "incrementCounter" => ->(o, a, c) {
        counter = App::Counter.find(a[:id])
        counter.increment
        counter
      }
    },
    "Query" => {
      "counter" => ->(o, a, c) { App::Counter.find(a[:id]) }
    },
    "Counter" => {
      "value" => ->(o, a, c) { o.value },
      "id" => ->(o, a, c) { o.id },
    }
  }

  # Schema, defined from the definition then updated with subscription info
  Schema = GraphQL::Schema.from_definition(Definition, default_resolve: Resolvers)
  Schema.class_eval do
    # use GraphQL::Enterprise::MutationLimiter, redis: Redis.new
    if ENV["TESTING_ABLY"]
      use GraphQL::Pro::AblySubscriptions, redis: Redis.new, ably: Ably::Rest.new(key: 'u0LX_A.Cdshgw:DHQ5clPJTuPFB0A8')
    elsif ENV["TESTING_PUBNUB"]
      pubnub = Pubnub.new(
          subscribe_key: "sub-c-213504de-a80a-11ea-b76e-1eafcc03cece",
          publish_key: "pub-c-03819030-90fd-46c3-b903-8c328c1ce4da"
      )
      use GraphQL::Pro::PubnubSubscriptions, redis: Redis.new, pubnub: pubnub
    else
      use GraphQL::Pro::PusherSubscriptions, redis: Redis.new # , pusher: ...
    end
  end
end
