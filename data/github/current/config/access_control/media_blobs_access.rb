# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :create_media_blob do |access|
    access.ensure_context :repo
    access.allow :repo_contents_writer
  end

  define_access :get_media_blob do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :read_media_blob_locks do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :write_media_blob_locks do |access|
    access.ensure_context :repo
    access.allow :repo_contents_writer
  end

  define_access :override_media_blob_locks do |access|
    access.ensure_context :repo
    access.allow :repo_admin
  end
end
