# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'container_service'

module Proto
  module RegistryMetadata
    module V1
      module Container
        class MetadataService < ::Twirp::Service
          package 'github.registry.metadata.v1.container'
          service 'Metadata'
          rpc :PutMetadata, PutMetadataRequest, PutMetadataResponse, :ruby_method => :put_metadata
          rpc :GetMetadata, GetMetadataRequest, GetMetadataResponse, :ruby_method => :get_metadata
          rpc :GetTags, GetTagsRequest, GetTagsResponse, :ruby_method => :get_tags
          rpc :GetTag, GetTagRequest, GetTagResponse, :ruby_method => :get_tag
          rpc :Authenticate, AuthenticateRequest, AuthenticateResponse, :ruby_method => :authenticate
          rpc :ValidateToken, ValidateTokenRequest, ValidateTokenResponse, :ruby_method => :validate_token
          rpc :PutLayer, PutLayerRequest, PutLayerResponse, :ruby_method => :put_layer
          rpc :GetLayer, GetLayerRequest, GetLayerResponse, :ruby_method => :get_layer
          rpc :GetLayers, GetLayersRequest, GetLayersResponse, :ruby_method => :get_layers
          rpc :ValidateAndUpdateLayers, UpdateLayersRequest, UpdateLayersResponse, :ruby_method => :validate_and_update_layers
          rpc :LinkLayer, LinkLayerRequest, LinkLayerResponse, :ruby_method => :link_layer
          rpc :GetCatalog, GetCatalogRequest, GetCatalogResponse, :ruby_method => :get_catalog
        end

        class MetadataClient < ::Twirp::Client
          client_for MetadataService
        end
      end
    end
  end
end
