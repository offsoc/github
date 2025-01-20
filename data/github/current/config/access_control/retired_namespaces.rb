# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :retire_repository_namespace,
                :unretire_repository_namespace do |access|
    access.ensure_context :repo
    access.allow :site_admin
  end
end
