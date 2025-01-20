# typed: true
# frozen_string_literal: true
class Api::AccessControl < Egress::AccessControl
  define_access :read_licensing do  |access|
    access.ensure_context :resource
    access.allow :licensing_reader
  end
end
