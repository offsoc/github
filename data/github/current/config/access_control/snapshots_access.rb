# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :get_snapshot do |access|
    access.ensure_context :repo
    access.allow(:everyone)    { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :create_snapshot do |access|
    access.ensure_context :repo
    access.allow :repo_contents_writer
  end
end
