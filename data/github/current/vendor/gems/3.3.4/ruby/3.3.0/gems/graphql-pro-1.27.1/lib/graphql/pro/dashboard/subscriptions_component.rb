# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      class SubscriptionsComponent < Component
        def enabled?
          @schema.subscriptions.is_a?(GraphQL::Pro::Subscriptions)
        end

        template_path_from(__FILE__)

        configure_routes({
          "GET" => {
            "topics" => :topics_index,
            "topics/:topic" => :topics_show,
            "subscriptions/:subscription_id" => :subscriptions_show,
          },
          "POST" => {
            "subscriptions_clear" => :subscriptions_clear,
          }
        })

        def doc_url
          "http://graphql-ruby.org/subscriptions/pusher_implementation"
        end

        def topics_index(request:)
          page = (request.params["page"] || "1").to_i
          per_page = (request.params["per_page"] || "20").to_i
          offset = per_page * (page - 1)
          limit = per_page
          topics, all_topics_count, _has_next_page = @schema.subscriptions.topics(offset: offset, limit: limit)
          {
            tab: "subscriptions",
            title: "Subscription Topics",
            topics: topics,
            topics_count: all_topics_count,
            prev_page: page > 1 ? page - 1 : false ,
            next_page: all_topics_count > (offset + limit) ? page + 1 : false,
          }
        end

        def subscriptions_show(request:)
          subscription_id = request.params["subscription_id"]
          query_data = @schema.subscriptions.read_subscription(subscription_id)
          {
            tab: "subscriptions",
            title: "Subscription #{subscription_id}",
            subscription_id: subscription_id,
            query_data: query_data,
          }
        end

        def topics_show(request:)
          topic_name = request.params["topic"]
          all_subscription_ids = []
          @schema.subscriptions.each_subscription_id(topic_name) do |sid|
            all_subscription_ids << sid
          end

          page = (request.params["page"] || "1").to_i
          limit = (request.params["per_page"] || "20").to_i
          offset = limit * (page - 1)
          subscription_ids = all_subscription_ids[offset, limit]

          {
            tab: "subscriptions",
            title: "#{topic_name}",
            topic_name: topic_name,
            subscriptions_count: all_subscription_ids.size,
            subscription_ids: subscription_ids,
            next_page: all_subscription_ids.size > offset + limit ? page + 1 : false,
            prev_page: page > 1 ? page - 1 : false,
          }
        end

        def subscriptions_clear(request:)
          @schema.subscriptions.clear
          redirect_to("/topics")
        end
      end
    end
  end
end
