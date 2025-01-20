# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("services/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # ServicesQueryBinder contains methods for accessing services.
    class ServicesQueryBinder < QueryBinder
      # Default service detail fragment. This defines what fields to return for the service.
      # @return [String]
      SERVICE_DETAIL_FRAGMENT = <<-'GRAPHQL'
        fragment ServiceDetail on Service {
          id
          name
          longName
          kind
          description
          qos
          repositoryURL
          productManager {
            ...OwnerDetail
          }
          maintainer {
            ...OwnerDetail
          }
          team {
            ...OwnerDetail
          }
          execSponsor {
            ...OwnerDetail
          }
          volunteers {
            nodes {
              ...OwnerDetail
            }
          }
          froms {
            nodes {
              job
              source
              sourceLastUpdated
            }
          }
          slos {
            totalCount
          }
        }
        fragment OwnerDetail on Owner {
          id
          name
          active
        }
      GRAPHQL

      # Default service link detail fragment. This defines what fields to return for the ServiceLink.
      # @return [String]
      SERVICE_LINK_DETAIL_FRAGMENT = <<~GRAPHQL
        fragment ServiceLinkDetail on ServiceLink {
          id
          name
          description
          url
          kind
          source
        }
      GRAPHQL

      SERVICE_METADATA_VALUE_DETAIL_FRAGMENT = <<~GRAPHQL
        fragment ServiceMetadataValueDetail on ServiceMetadataValue {
          id
          serviceMetadataKind {
            id
            name
            description
          }
          value
        }
      GRAPHQL

      # Find a single Service.
      #
      # @param name [String] The name of the service (exact)
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] The matching service.
      def find(**kwargs)
        Response.new Client::Services::FindServiceQuery.execute(client: client, **kwargs)
      end

      # List all Service Dependencies for a given Service.
      #
      # @param service_name [String] The name of the service (exact)
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] All service dependencies for the service
      def dependencies(service_name:, context: {})
        Response.new Client::Services::ListServiceDependenciesQuery.execute(client: client, service_name: service_name, context: context)
      end

      # List all Service Links for a given Service.
      #
      # @param service_name [String] The name of the service (exact)
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] All service links for the service
      def links(service_name:, context: {})
        Response.new Client::Services::ListServiceLinksQuery.execute(client: client, service_name: service_name, context: context)
      end

      # List all Service Metadata Values for a given Service.
      #
      # @param context [Hash] Additional headers to add to the request (optional)
      # @param service_name [String] The name of the service whose metadata values you're requesting (exact)
      # @param service_metadata_kind_names [Array<String>] A list of metadata kinds to retrieve. If set to nil, metadata values of any kind are returned. (optional)
      # @param service_metadata_value_detail_fragment [String] (optional) A GraphQL fragment defining 'ServiceMetadataValueDetail' to fetch the metadata value fields desired
      #
      # @return [Response] All support levels for the service
      def service_metadata_values(service_name:, service_metadata_kind_names: nil, context: {})
        Response.new Client::Services::ListServiceMetadataValuesQuery.execute(client: client, service_name: service_name, service_metadata_kind_names: service_metadata_kind_names,  context: context)
      end

      # List all Support Levels for a given Service.
      #
      # @param service_name [String] The name of the service (exact)
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] All support levels for the service
      def support_levels(service_name:, context: {})
        Response.new Client::Services::ListSupportLevelsQuery.execute(client: client, service_name: service_name, context: context)
      end

      # Mutations

      # Add a dependency for a given service.
      #
      # @param client [Client] The client to use to query
      # @param context [Hash] Added context to add to the request as headers
      # @param service_name [String] The name of the service that requires the dependency
      # @param dependency_name [String] The name of the service that provides the dependency
      #
      # @return [Response]
      def add_service_dependency(**kwargs)
        Response.new Client::Services::AddServiceDependencyMutation.execute(client: client, **kwargs)
      end

      # Remove a dependency from given service.
      #
      # @param client [Client] The client to use to query
      # @param context [Hash] Added context to add to the request as headers
      # @param service_dependency_id [String] The ID of the service dependency to remove
      #
      # @return [Response]
      def remove_service_dependency(**kwargs)
        Response.new Client::Services::RemoveServiceDependencyMutation.execute(client: client, **kwargs)
      end

      # Create or update a service.
      #
      # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
      # @param context [Hash] Additional headers to add to the request (optional)
      # @param name [String] The name of the service (no spaces)
      # @param long_name [String] The friendly name of the service (Title Case)
      # @param description [String] A sentence that describes what the service does.
      # @param kind [String] A sentence that describes what the service does.
      # @param repository_url [String] A link to the service's project or code repository.
      # @param qos [String] The Quality of Service provided (e.g. critical, experimental, deprecated)
      # @param owners [ServiceOwner] A list of ServiceOwner objects describing an owner and their relationship to the service. {ownerName: "hubot", kind: "maintainer"}
      # @param source_kind [String] The source responsible for populating this information (e.g. a background job, web)
      # @param source_last_updated [Time] The time the ownership source data last changed.
      # @param source_url [String] A URL pointing to the source of the ownership information.
      #
      # @return [Response]
      def update_service(**kwargs)
        Response.new Client::Services::UpdateServiceMutation.execute(client: client, **kwargs)
      end

      # Delete a service.
      #
      # @param client [Client] The client to use to query
      # @param context [Hash] Added context to add to the request as headers
      # @param service_name [String] The name of the service to delete (exact)
      #
      # @return [Response]
      def delete_service(**kwargs)
        Response.new Client::Services::DeleteServiceMutation.execute(client: client, **kwargs)
      end

      # Remove a support level from given service.
      #
      # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
      # @param context [Hash] Additional headers to add to the request (optional)
      # @param service_name [String] The name of the service whose support level you're removing (exact)
      # @param level [String] The level attribute of the support level you're removing e.g. sev1, sev2, sev3
      #
      # @return [Response]
      def remove_support_level(**kwargs)
        Response.new Client::Services::RemoveSupportLevelMutation.execute(client: client, **kwargs)
      end
    end
  end
end
