# typed: strict
# frozen_string_literal: true

require "contentful"

module Tapioca
  module Compilers
    # Contentful Entries dynamically creates a method for each field defined within contentful. In order to determine
    # what fields are defined, the entry class must have a `contentful_client` method. Once the fields are determined,
    # a method is created for each. The return type is determined by the field type. Where applicable, this tries to
    # match the return type to the entity mapping that is also configured on the contentful client.
    class ContentfulEntry < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(Site::Contentful::Entry) } }

      sig { override.returns(T::Enumerable[T.class_of(Site::Contentful::Entry)]) }
      def self.gather_constants
        # Ensure the contentful client can be loaded before trying to gather constants. This helps protect against
        # outages in the Contentful service.
        descendants_of(Site::Contentful::Entry).select(&:contentful_client)
      rescue ::Contentful::Error => e
        Failbot.report(e)
        []
      end

      sig { override.void }
      def decorate
        # Don't generate methods for classes that don't have a cached content type. This is usually because the class
        # is a parent class for similar content types.
        return if content_type_id.nil?
        root.create_path(constant) do |klass|
          created_methods = []

          contentful_fields.each do |field|
            klass.create_method(field.id.underscore, return_type: coerce_return_type(field))
            created_methods << field.id.underscore
          end

          # Create base sys methods. Technically `type` is the only one that is guaranteed to be present, but `id` is
          # also commonly used and relied on by some of the contentful classes. Contentful also allows fields to
          # conflict with these, so here we prioritize any fields on the model that might have the same name.
          klass.create_method("type", return_type: "String") unless created_methods.include?("type")
          klass.create_method("id", return_type: "T.nilable(String)") unless created_methods.include?("id")
          klass.create_method("created_at", return_type: "DateTime") unless created_methods.include?("created_at")
          klass.create_method("updated_at", return_type: "DateTime") unless created_methods.include?("updated_at")
          klass.create_method("content_type", return_type: "::Contentful::ContentType") unless created_methods.include?("content_type")
        end
      end

      sig { returns(T::Array[::Contentful::Field]) }
      private def contentful_fields
        ::Contentful::ContentTypeCache.cache_get(space_id, content_type_id).fields
      end

      sig { params(field: ::Contentful::Field).returns(String) }
      private def coerce_return_type(field)
        maybe_nilable(field, get_type(field))
      end

      sig { params(field: ::Contentful::Field).returns(String) }
      private def get_type(field)
        case field.type
        when "Symbol" then "String"
        when "Integer", "Float" then field.type
        when "Date" then "DateTime"
        when "Link" then link_type(field)
        when "RichText"
          "{ content: T::Array[T.untyped] }"
        when "Array"
          "T::Array[#{get_type(field.items)}]"
        else "T.untyped"
        end
      end

      sig { returns(::Contentful::Client) }
      private def contentful_client
        @contentful_client ||= T.let(constant.contentful_client, T.nilable(::Contentful::Client))
      end

      sig { returns(String) }
      private def space_id
        contentful_client.configuration[:space]
      end

      sig { returns(T.nilable(String)) }
      private def content_type_id
        @id ||= T.let(nil, T.nilable(String))
        return @id if !@id.nil?
        @id, _ = contentful_client.configuration[:entry_mapping].find do |_, entry_klass|
          entry_klass == constant
        end
        @id
      end

      sig { params(id: String).returns(T.nilable(T.class_of(::Contentful::Entry))) }
      private def get_mapped_content_type_class(id)
        _, klass = contentful_client.configuration[:entry_mapping].find do |entry_type, _|
          entry_type == id
        end
        klass
      end

      sig { params(field: ::Contentful::Field).returns(String) }
      private def link_type(field)
        case field.link_type
        when "Asset"
          asset_link(field)
        when "Entry"
          any(valid_content_types(field))
        else
          "T.untyped"
        end
      end

      sig { params(field: ::Contentful::Field).returns(String) }
      private def asset_link(field)
        custom_asset_klass = contentful_client.configuration.dig(:resource_mapping, "Asset")
        return custom_asset_klass.to_s if custom_asset_klass.present?

        "::Contentful::Asset"
      end

      sig { params(field: ::Contentful::Field).returns(T::Array[String]) }
      private def valid_content_types(field)
        field.raw["validations"].flat_map do |validation|
          next if validation["linkContentType"].nil?

          field_name = validation["linkContentType"].map do |id|
            get_mapped_content_type_class(id)
          end.compact.map(&:to_s)
        end.compact
      end

      sig { params(types: T::Array[String]).returns(String) }
      private def any(types)
        return "T.untyped" if types.empty?
        return T.cast(types.first, String) if types.length == 1

        "T.any(#{types.join(", ")})"
      end

      sig { params(field: ::Contentful::Field, type: String).returns(String) }
      def maybe_nilable(field, type)
        return type if type == "T.untyped"

        "T.nilable(#{type})"
      end
    end
  end
end
