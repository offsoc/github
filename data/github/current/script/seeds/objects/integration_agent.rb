# typed: true
# frozen_string_literal: true

module Seeds
  module Objects
    class IntegrationAgent
      def self.create(integration:)
        description ||= "A new integration agent"
        url ||= "https://github.com"
        ::IntegrationAgent.create(integration: integration, description: description, url: url)
      end
    end
  end
end
