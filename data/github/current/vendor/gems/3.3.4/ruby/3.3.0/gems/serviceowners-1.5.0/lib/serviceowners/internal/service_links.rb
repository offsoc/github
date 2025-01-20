# typed: true
# frozen_string_literal: true

module Serviceowners
  module Internal
    # An internal class encapsulating the logic for generating service links
    class ServiceLinks
      def initialize(service)
        @service = service
      end

      def to_a
        links = %i[sentry datadog looker ae_dashboard playbook ae_playbook bones].map do |method|
          send(method)
        end

        links.compact
      end

      private

      attr_reader :service

      def sentry
        {
          "name" => "#{service.human_name} Sentry",
          "description" => "Sentry issues #{description}",
          "kind" => "tool",
          "service" => service.qualified_name,
          "url" => "https://sentry.io/organizations/github/issues/?query=cause_catalog_service%3Agithub%2F#{service.name}"
        }
      end

      def datadog
        return unless (url = service.datadog_dashboard)

        {
          "name" => "#{service.human_name} DataDog Dashboard",
          "description" => "DataDog dashboard #{description}",
          "kind" => "dashboard",
          "service" => service.qualified_name,
          "url" => url
        }
      end

      def looker
        return unless (url = service.looker_dashboard)

        {
          "name" => "#{service.human_name} Looker Dashboard",
          "description" => "Looker dashboard #{description}",
          "kind" => "dashboard",
          "service" => service.qualified_name,
          "url" => url
        }
      end

      def ae_dashboard
        return unless (url = service.ae_dashboard)

        {
          # This is slightly oddly named, but it has to be to match the scorecard.
          # See https://github.com/github/cat/blob/HEAD/app/jobs/ghae_score_update_job.rb#L184
          "name" => "GHAE Dashboard (#{service.human_name})",
          "description" => "GHAE Dashboard #{description}",
          "kind" => "dashboard",
          "service" => service.qualified_name,
          "url" => url
        }
      end

      def playbook
        return unless (url = service.playbook)

        {
          "name" => "#{service.human_name} Playbook",
          "description" => "Playbook #{description}",
          "kind" => "playbook",
          "service" => service.qualified_name,
          "url" => url
        }
      end

      def ae_playbook
        return unless (url = service.ae_playbook)

        {
          # This is slightly oddly named, but it has to be to match the scorecard.
          # See https://github.com/github/cat/blob/HEAD/app/jobs/ghae_score_update_job.rb#L219
          "name" => "GHAE Playbook (#{service.human_name})",
          "description" => "GHAE Playbook #{description}",
          "kind" => "playbook",
          "service" => service.qualified_name,
          "url" => url
        }
      end

      def bones
        {
          "name" => "#{service.human_name} on Bones",
          "description" => "Link to service on Bones",
          "kind" => "tool",
          "service" => service.qualified_name,
          "url" => "https://bones.githubapp.com/services/#{service.name}"
        }
      end

      def description
        return @description if defined?(@description)

        @description = "for the monolith's github/#{service.name} service"
      end
    end
  end
end
