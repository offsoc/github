# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :project_next_read do |access|
    access.ensure_context :resource
    access.allow :project_next_reader
  end

  define_access :project_next_write do |access|
    access.ensure_context :resource
    access.allow :project_next_writer
  end
end
