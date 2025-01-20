# typed: true
# frozen_string_literal: true

module Hydro
  module EntitySerializer
    module ExemptionsDependency
      extend T::Helpers

      module ClassMethods
        extend T::Sig

        sig { params(entity: T.nilable(Exemptions::ExemptionRequest)).returns(T.nilable(T::Hash[T.untyped, T.untyped])) }
        def exemption_request(entity)
          return unless entity
          exemption_request = entity.attributes.symbolize_keys.slice(
            :id,
            :number,
            :resource_owner_id,
            :resource_owner_type,
            :resource_identifier,
            :metadata,
            :created_at,
            :updated_at,
            :expires_at
          )

          exemption_request[:request_type] = if Exemptions::ExemptionRequest::REQUEST_EVALUATORS.map { |evaluator| evaluator.request_type }.include?(entity.request_type)
            entity.request_type.upcase.to_sym
          else
            :REQUEST_TYPE_UNKNOWN
          end

          exemption_request[:metadata]&.each do |key, value|
            # Value is expected to be a string
            if value.nil?
              exemption_request[:metadata][key] = ""
              next
            end
          end

          exemption_request[:status] = if Exemptions::ExemptionRequest::STATUSES.keys.include?(entity.status)
            entity.status.upcase.to_sym
          else
            :REQUEST_STATUS_UNKNOWN
          end

          exemption_request[:requester] = Hydro::EntitySerializer.user(entity.requester)

          exemption_request[:repository] = Hydro::EntitySerializer.repository(entity.repository)

          exemption_request[:responses] = entity.responses.map do |response|
            exemption_response(response)
          end

          exemption_request
        end

        sig { params(entity: T.nilable(Exemptions::ExemptionResponse)).returns(T.nilable(T::Hash[T.untyped, T.untyped])) }
        def exemption_response(entity)
          return unless entity
          status = if Exemptions::ExemptionResponse::STATUSES.keys.include?(entity.status)
            entity.status.upcase.to_sym
          else
            :RESPONSE_STATUS_UNKNOWN
          end

          {
            id: entity.id,
            exemption_request_id: entity.exemption_request_id,
            reviewer: Hydro::EntitySerializer.user(entity.reviewer),
            status: status,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
          }
        end
      end

      mixes_in_class_methods(ClassMethods)
    end
  end
end
