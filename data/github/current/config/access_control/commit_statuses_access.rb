# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_status do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :status_reader
  end

  define_access :write_status do |access|
    access.ensure_context :resource
    access.allow :status_writer
  end
end
