# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :enterprise do |access|
    access.allow :site_admin
  end

  define_access :create_permissionless_installation_token do |access|
    access.allow(:permissionless_installation_token_creator)
  end
end
