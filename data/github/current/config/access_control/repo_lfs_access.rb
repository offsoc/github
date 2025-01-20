# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access(
    :manage_lfs_for_repo
  ) do |access|
    access.ensure_context :resource
    if GitHub.enterprise?
      access.allow :site_admin
    else
      access.allow :lfs_writer
    end
  end

end
