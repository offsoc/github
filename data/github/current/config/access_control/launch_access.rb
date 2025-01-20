# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  # TODO - remove this?
  define_access :configure_launch do |access|
    access.ensure_context :resource
    access.allow :repo_contents_reader
  end
end
