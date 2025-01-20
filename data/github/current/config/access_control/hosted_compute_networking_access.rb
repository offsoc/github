# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_org_network_configurations do |access|
    access.ensure_context :resource
    access.allow :org_network_configurations_writer
  end

  define_access :read_org_network_configurations do |access|
    access.ensure_context :resource
    access.allow :org_network_configurations_reader
  end
end
