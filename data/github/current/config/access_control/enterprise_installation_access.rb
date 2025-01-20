# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :enterprise_installation_create do |access|
    access.allow :everyone
  end

  define_access :enterprise_installation do |access|
    access.allow :everyone
  end

  define_access :enterprise_usage_metrics do |access|
    access.allow :everyone
  end

  define_access :read_s4_enterprise_data do  |access|
    access.ensure_context :resource
    access.allow :s4_enterprise_data_reader
  end

  define_access :read_s4_org_data do  |access|
    access.ensure_context :resource
    access.allow :s4_organization_data_reader
  end

  define_access :external_contributions do |access|
    access.ensure_context :user
    access.allow :external_contributions_writer
  end
end
