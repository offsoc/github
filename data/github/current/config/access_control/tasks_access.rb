# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :upload_task_log do |access|
    resource_must_belong_to_repo(access)
    access.allow :repo_contents_writer
  end
end
