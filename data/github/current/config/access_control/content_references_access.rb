# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_content_reference do |access|
    access.ensure_context :user, :resource
    access.allow :content_reference_integration_reader
  end

  define_access :write_content_reference do |access|
    access.ensure_context :user, :resource
    access.allow :content_reference_integration_writer
  end
end
