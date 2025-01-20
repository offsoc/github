# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_projects do |access|
    access.ensure_context :owner
    access.allow :project_lister
  end

  define_access :show_project do |access|
    access.ensure_context :resource
    access.allow :project_reader
  end

  define_access :create_project do |access|
    access.ensure_context :owner
    access.allow :project_creator
  end

  define_access :update_project do |access|
    access.ensure_context :resource
    access.allow :project_writer
  end

  define_access :delete_project do |access|
    access.ensure_context :resource
    access.allow :project_writer
  end

  define_access :list_project_collaborators do |access|
    access.ensure_context :resource
    access.allow :project_admin
  end

  define_access :add_project_collaborator do |access|
    access.ensure_context :resource
    access.allow :project_admin
  end

  define_access :remove_project_collaborator do |access|
    access.ensure_context :resource
    access.allow :project_admin
  end

  define_access :project_repository_links_write do |access|
    access.ensure_context :resource
    access.allow :project_repository_links_write
  end
end
