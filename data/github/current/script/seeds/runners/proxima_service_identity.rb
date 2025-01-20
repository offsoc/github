# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ProximaServiceIdentity < Seeds::Runner
      def self.help
        <<~HELP
        Adds a ProximaServiceIdentity for the avocado test tenant. ProximaServiceIdentity is used to
        enforce teneant scoped rate limiting for Proxima clients that make unathenticated calls to the public
        REST API.

        See: https://github.com/github/proxima/blob/main/adr/tenant-bound-actor-model.md
        HELP
      end

      def self.run(options = {})
        @avo_tenant = Seeds::Objects::Business.avocado_gmbh

        ::ProximaServiceIdentity::REGISTERED_SERVICES.each do |service_name|
          rate_limit = ::ProximaServiceIdentity.default_rate_limit(service_name) * 2

          retries = 0
          begin
            puts "Creating ProximaServiceIdentity for service #{service_name} with a rate limit of #{rate_limit}"
            psi = ::ProximaServiceIdentity.find_or_create_by!(service_name: service_name, tenant_shortcode: @avo_tenant.shortcode, rate_limit: rate_limit)
            puts "Created ProximaServiceIdentity for service #{service_name}"
          rescue ActiveRecord::RecordNotUnique
            retry if (retries += 1) < 2
            raise "Exhausted retries creating ProximaServiceIdentity for service #{service_name}: RecordNotUnique"
          rescue => e
            puts "Failed to create ProximaServiceIdentity for service #{service_name}: #{e.message}"
            raise e
          end
        end
      end
    end
  end
end
