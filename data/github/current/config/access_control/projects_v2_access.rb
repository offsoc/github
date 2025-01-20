# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :project_v2_read do |access|
    access.ensure_context :resource
    access.allow :project_v2_reader
  end

  define_access :project_v2_write do |access|
    access.ensure_context :resource
    access.allow :project_v2_writer
  end

  define_access :project_v2_writer_read_only do |access|
    access.ensure_context :resource
    access.allow :project_v2_writer_read_only
  end

  define_access :project_v2_create do |access|
    access.ensure_context :resource
    access.allow :project_v2_creator
  end

  define_access :project_v2_admin do |access|
    access.ensure_context :resource
    access.allow :project_v2_administrator
  end
end
