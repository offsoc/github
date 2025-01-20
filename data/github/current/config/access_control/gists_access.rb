# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_gists do |access|
    access.allow :everyone
  end

  define_access :list_user_gists do |access|
    access.allow :authenticated_user
  end

  define_access :list_user_secret_gists do |access|
    access.allow(:gist_private_lister)
  end

  define_access :get_gist, :list_gist_comments, :get_gist_contents do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].try(:active?) }
  end

  define_access :get_gist_comment do |access|
    access.ensure_context :resource
    access.allow :everyone
  end

  define_access :create_gist_comment do |access|
    access.allow :gist_comment_creator
  end

  define_access :update_gist_comment, :delete_gist_comment do |access|
    access.ensure_context :resource, :user
    access.allow :gist_comment_editor
  end

  define_access :minimize_gist_comment do |access|
    access.allow :gist_comment_minimizer
  end

  define_access :create_gist do |access|
    access.allow :gist_creator
  end

  define_access :update_gist, :delete_gist do |access|
    access.allow :gist_editor
  end

  define_access :fork_gist do |access|
    access.allow :gist_forker
  end

  define_access :list_gist_forks do |access|
    access.allow :gist_fork_reader
  end

  define_access :get_gist_star do |access|
    access.allow :gist_star_reader
  end

  define_access :list_gist_stars do |access|
    access.allow :gist_star_reader
  end

  define_access :star_gist, :unstar_gist do |access|
    access.allow :gist_starrer
  end
end
