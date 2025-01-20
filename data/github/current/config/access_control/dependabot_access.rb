# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_dependabot_secrets do |access|
    access.ensure_context :resource
    access.allow :dependabot_secrets_writer
  end

  define_access :read_dependabot_secrets do |access|
    access.ensure_context :resource
    access.allow :dependabot_secrets_reader
  end

  define_access :write_org_dependabot_secrets do |access|
    access.ensure_context :resource
    access.allow :org_dependabot_secrets_writer
  end

  define_access :read_org_dependabot_secrets do |access|
    access.ensure_context :resource
    access.allow :org_dependabot_secrets_reader
  end
end
