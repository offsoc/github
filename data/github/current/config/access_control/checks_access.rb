# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_check_suite do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :check_suite_reader
  end

  define_access :read_check_run do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :check_run_reader
  end

  define_access :write_check_run do |access|
    access.ensure_context :resource
    access.allow :check_run_writer
  end

  define_access :set_check_suite_preferences do |access|
    access.ensure_context :resource
    access.allow :check_suite_preferences_writer
  end

  define_access :write_check_suite do |access|
    access.ensure_context :resource
    access.allow :check_suite_writer
  end

  define_access :request_check_suite do |access|
    access.ensure_context :resource
    access.allow :check_suite_requester
  end

  define_access :request_check_run do |access|
    access.ensure_context :resource
    access.allow :check_run_requester
  end
end
