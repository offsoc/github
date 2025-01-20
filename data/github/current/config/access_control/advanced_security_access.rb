# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_advanced_security_admin_enterprise do |access|
    access.ensure_context :resource
    access.allow :enterprise_advanced_security_writer
  end
end
