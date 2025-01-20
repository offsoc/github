# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :staff_api do |access|
    access.allow :site_admin
  end

  define_access :admin_api do |access|
    access.allow :site_admin
  end
end
