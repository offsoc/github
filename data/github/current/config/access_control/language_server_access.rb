# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :lsp_get_index do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :lsp_get_definition do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :lsp_get_references do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end
end
