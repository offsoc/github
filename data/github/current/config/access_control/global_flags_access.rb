# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_global_flags do |access|
    access.allow :global_feature_flags_reader
  end
end
