# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_repo_attestation do |access|
    access.ensure_context :repo
    access.allow :repo_attestation_writer
  end

  define_access :read_repo_attestation do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_attestation_reader
  end
end
