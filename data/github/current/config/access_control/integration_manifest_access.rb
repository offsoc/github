# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_integration_manifest_conversion do |access|
    access.allow(:everyone)
  end
end
