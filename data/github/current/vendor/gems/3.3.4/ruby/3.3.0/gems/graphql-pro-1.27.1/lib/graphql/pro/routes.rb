# frozen_string_literal: true

module GraphQL
  module Pro
    module Routes
      [GraphQL::Schema, GraphQL::Schema.singleton_class].each do |schema_cls|
        refine schema_cls do
          # @return [GraphQL::Pro::Dashboard] A rack app for browsing GraphQL::Pro data
          def dashboard
            GraphQL::Pro::Dashboard.new(schema: self)
          end

          def ui
            warn("`Schema#ui` is deprecated, use `Schema#dashboard` instead")
            dashboard
          end

          # @return [GraphQL::Pro::OperationStore::Endpoint] A rack app for receiving stored operations from clients
          def operation_store_sync
            GraphQL::Pro::OperationStore::Endpoint.new(schema: self)
          end

          # @return [PusherSubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Pusher
          def pusher_webhooks_client
            GraphQL::Pro::PusherSubscriptions::WebhooksClient.new(schema: self)
          end

          # @return [AblySubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Ably
          def ably_webhooks_client
            GraphQL::Pro::AblySubscriptions::WebhooksClient.new(schema: self)
          end

          # @return [PubnubSubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Pubnub
          def pubnub_webhooks_client
            GraphQL::Pro::PubnubSubscriptions::WebhooksClient.new(schema: self)
          end
        end
      end

      class Lazy
        def initialize(schema_class_name)
          @schema_class_name = schema_class_name
        end

        # @return [GraphQL::Pro::Dashboard] A rack app for browsing GraphQL::Pro data
        def dashboard
          GraphQL::Pro::Dashboard.new(schema_class_name: @schema_class_name)
        end

        # @return [GraphQL::Pro::OperationStore::Endpoint] A rack app for receiving stored operations from clients
        def operation_store_sync
          GraphQL::Pro::OperationStore::Endpoint.new(schema_class_name: @schema_class_name)
        end

        # @return [PusherSubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Pusher
        def pusher_webhooks_client
          GraphQL::Pro::PusherSubscriptions::WebhooksClient.new(schema_class_name: @schema_class_name)
        end

        # @return [AblySubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Ably
        def ably_webhooks_client
          GraphQL::Pro::AblySubscriptions::WebhooksClient.new(schema_class_name: @schema_class_name)
        end

        # @return [PubnubSubscriptions::WebhooksClient] A rack app for getting unsubscribe hooks from Pubnub
        def pubnub_webhooks_client
          GraphQL::Pro::PubnubSubscriptions::WebhooksClient.new(schema_class_name: @schema_class_name)
        end
      end
    end
  end
end
