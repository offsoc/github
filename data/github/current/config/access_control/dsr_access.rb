# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :dsr_export do |access|
    access.allow :admin_of_current_tenant
  end
end
