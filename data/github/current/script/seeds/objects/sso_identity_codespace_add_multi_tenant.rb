# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceAddMultiTenant
      def self.on_multi_tenant_enterprise(tenant)
        begin
          GitHub.multi_tenant_enterprise = true

          GitHub::CurrentTenant.set(tenant) if tenant

          yield if block_given?
        ensure
          # only unset Tenant if this was called with a block and tenant
          GitHub::CurrentTenant.remove if tenant
          GitHub.multi_tenant_enterprise = false
        end
      end
    end
  end
end
