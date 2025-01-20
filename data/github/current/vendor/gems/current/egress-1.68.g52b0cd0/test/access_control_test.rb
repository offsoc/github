require "egress/test"

class AccessControlTest < Egress::Test

  class BlogPost::AccessControl < Egress::AccessControl
    role :everyone

    role :blog_reader do |context|
      extract(context, :user)
    end

    define_access :list do |access|
      access.ensure_context :resource
      access.allow(:everyone) { |c| c[:resource].public? }
      access.allow :blog_reader
    end

    define_access :delete do |access|
      access.allow :blog_deleter
    end

    define_access :read do |access|
    end
  end

  def test_define_roles
    assert_equal 0, Egress::AccessControl.roles.count
    assert_equal 2, BlogPost::AccessControl.roles.count

    everyone_role = BlogPost::AccessControl.roles[:everyone]
    refute_nil everyone_role
    assert everyone_role.has_access?(nil)

    blog_reader_role = BlogPost::AccessControl.roles[:blog_reader]
    refute_nil blog_reader_role
    refute blog_reader_role.has_access?(nil)
  end

  def test_define_access
    assert_equal 0, Egress::AccessControl.permissions.count
    assert_equal 3, BlogPost::AccessControl.permissions.count

    permission_to_list = BlogPost::AccessControl.permissions[:list]
    refute_nil permission_to_list
  end

  def test_access_to_public_resource
    context = { :verb => :list, :resource => BlogPost.new(:public => true) }

    grant = BlogPost::AccessControl.access_grant(context)
    assert_equal :list, grant.verb
    assert grant.matched_role_names.include?(:everyone)
    refute grant.matched_role_names.include?(:blog_reader)
    assert_equal [], grant.accepted_scopes

    assert BlogPost::AccessControl.access_allowed?(context)
  end

  def test_access_to_public_resource_with_user
    context = { :verb => :list, :resource => BlogPost.new(:public => true), :user => User.new }

    grant = BlogPost::AccessControl.access_grant(context)
    assert_equal :list, grant.verb
    assert grant.matched_role_names.include?(:everyone)
    assert grant.matched_role_names.include?(:blog_reader)

    assert BlogPost::AccessControl.access_allowed?(context)
  end

  def test_cannot_access_resource_without_a_user
    context = { :verb => :list, :resource => BlogPost.new }

    refute BlogPost::AccessControl.access_allowed?(context)
  end

  def test_access_resource_with_a_user
    context = { :verb => :list, :resource => BlogPost.new, :user => User.new }

    assert BlogPost::AccessControl.access_allowed?(context)
  end

  def test_access_with_no_role_checks
    context = { :verb => :read, :resource => BlogPost.new, :user => User.new }

    grant = BlogPost::AccessControl.access_grant(context)
    assert_equal :read, grant.verb
    assert grant.matched_roles.empty?

    assert BlogPost::AccessControl.access_allowed?(context)
  end

  def test_access_with_nil_context
    assert_raises ArgumentError do
      BlogPost::AccessControl.access_allowed?(nil)
    end
  end

  def test_access_with_no_verb
    assert_raises ArgumentError do
      refute BlogPost::AccessControl.access_allowed?(:resource => BlogPost.new)
    end
  end

  def test_access_with_no_resource
    refute BlogPost::AccessControl.access_allowed?(:verb => :list)
  end

  def test_access_with_verb_not_defined
    assert_raises Egress::AccessVerbError do 
      BlogPost::AccessControl.access_allowed?(:verb => :not_a_verb)
    end
  end

  def test_access_defined_with_bad_role
    assert_raises Egress::RoleError do
      BlogPost::AccessControl.access_allowed?(:verb => :delete)
    end
  end

  def test_cannot_define_role_twice
    assert_raises Egress::RoleError do
      BlogPost::AccessControl.role :blog_reader do |context|
      end
    end
  end

  # Test defining scopes
  #
  class BlogPostComment::AccessControl < Egress::AccessControl
    scope "user",                          :visibility => :public,    :no_sudo => true
    scope "user:write", :parent => "user", :visibility => :grantable, :no_sudo => true
    scope "user:read",  :parent => "user:write",                      :no_sudo => true
    scope "delete", :description => "delete access"

    role :everyone

    role :comment_reader, :scope => "user:read"

    role :comment_writer, :scope => "user" do |context|
      context[:user]
    end

    role :multi_scope_role, :scope => ["user", "delete"]

    role :bad_scope_checker do |context|
      user = extract(context, :user)
      user && scope?(user, "dude:is:not:a:scope")
    end

    define_access :list do |access|
      access.allow :comment_reader
    end

    define_access :update do |access|
      access.allow :comment_writer
    end

    define_access :delete do |access|
      access.allow :multi_scope_role
    end

    define_access :create do |access|
      access.allow :bad_scope_checker
    end
  end

  def blog_post_comment
    BlogPostComment::AccessControl
  end

  def test_scope_visibility
    assert_equal %w(delete user user:read user:write), blog_post_comment.acceptable_scope_names
    assert_equal %w(user user:write), blog_post_comment.public_scope_names
    assert_equal %w(user:write), blog_post_comment.grantable_scope_names
    assert_equal %w(delete), blog_post_comment.sudo_protected_scope_names
  end

  def test_scope_description
    scope = blog_post_comment.sudo_protected_scopes["delete"]
    assert_equal "delete access", scope.description
  end

  def test_scope_normalization
    [nil, "", " , , "].each do |empty|
      assert_equal [], blog_post_comment.normalize_scopes(empty), empty.inspect
    end

    assert_equal %w(delete user), blog_post_comment.normalize_scopes("delete,user", :visibility => :all)
    assert_equal %w(delete), blog_post_comment.normalize_scopes("delete", :visibility => :all)
    assert_equal %w(delete), blog_post_comment.normalize_scopes("delete,not-a-scope", :visibility => :all)
    assert_equal %w(user), blog_post_comment.normalize_scopes("user,user:write", :visibility => :all)
  end

  def test_scope_normalization_with_visibility
    assert_equal %w(), blog_post_comment.normalize_scopes("user:read")
    assert_equal %w(), blog_post_comment.normalize_scopes("user:read", :visibility => :grantable)
    assert_equal %w(user), blog_post_comment.normalize_scopes("user,delete", :visibility => :public)
    assert_equal %w(delete user), blog_post_comment.normalize_scopes("user,delete,user:read", :visibility => :all)
  end

  def test_access_to_resource
    context = {
      :verb     => :list,
      :resource => BlogPostComment.new,
      :user     => User.new(:scopes => "user:read")
    }

    grant = blog_post_comment.access_grant(context)
    assert grant.access_allowed?
    assert_equal ["user:read","user:write", "user"], grant.accepted_scopes
  end

  def test_access_to_resource_with_higher_scope
    context = {
      :verb     => :list,
      :resource => BlogPostComment.new,
      :user     => User.new(:scopes => "user")
    }

    assert blog_post_comment.access_allowed?(context)
  end

  def test_multiple_scopes
    context = {
      :verb     => :delete,
      :resource => BlogPostComment.new,
      :user     => User.new
    }

    grant = blog_post_comment.access_grant(context)
    refute grant.access_allowed?
    assert_equal ["user","delete"], grant.accepted_scopes
  end

  def test_try_access_with_wrong_scope
    context = {
      :verb     => :update,
      :resource => BlogPostComment.new,
      :user     => User.new(:scopes => "user:read")
    }

    refute blog_post_comment.access_allowed?(context)
  end

  def test_access_with_scope_that_doesnt_exist
    context = {
      :verb     => :update,
      :resource => BlogPostComment.new,
      :user     => User.new(:scopes => "woah")
    }

    refute blog_post_comment.access_allowed?(context)
  end

  def test_access_check_with_bad_scope
    assert_raises Egress::ScopeError do
      context = {
        :verb     => :create,
        :resource => BlogPostComment.new,
        :user     => User.new(:scopes => "user:read")
      }

      blog_post_comment.access_allowed?(context)
    end
  end

  class Repository::AccessControl < Egress::AccessControl
    scope "repo" do |scope|
      scope.has_whitelist :whitelisted_repository_ids
      scope.has_whitelist :whitelisted_owner_ids, :method => :owner_id
    end

    role :repo_reader do |context|
      user, repo = extract(context, :user, :resource)
      user && (
        scope?(user, "repo", :target => repo, :whitelist => :whitelisted_repository_ids) ||
        scope?(user, "repo", :target => repo, :whitelist => :whitelisted_owner_ids)
        )
    end

    role :whitelist_free_reader do |context|
      user, _repo = extract(context, :user, :resource)
      user && scope?(user, "repo")
    end

    define_access :list do |access|
      access.allow :repo_reader
    end

    define_access :whitelist_free_list do |access|
      access.allow :whitelist_free_reader
    end
  end

  def repository
    Repository::AccessControl
  end

  def test_access_resource_on_whitelist
    assert repository.access_allowed? context_for_whitelist([1, 2])
    assert repository.access_allowed? context_for_whitelist([1])
  end

  def test_cannot_access_resource_not_on_whitelist
    refute repository.access_allowed? context_for_whitelist([2, 4])
    refute repository.access_allowed? context_for_whitelist([2])
    refute repository.access_allowed? context_for_whitelist([])
  end

  def test_access_resource_on_owner_id_whitelist
    assert repository.access_allowed? context_for_owner_id_whitelist([404])
  end

  def test_cannot_access_resource_with_owner_id_not_on_whitelist
    refute repository.access_allowed? context_for_owner_id_whitelist([101])
  end

  def test_check_scope_without_using_whitelist
    context = {
      :verb     => :whitelist_free_list,
      :resource => Repository.new(:owner_id => 404),
      :user     => User.new(:id => 404, :scopes => "repo", :whitelisted_owner_ids => [101])
    }
    assert repository.access_allowed? context
  end

  def xtest_using_undeclared_whitelist
  end

  def context_for_whitelist(ids)
    {
      :verb     => :list,
      :resource => Repository.new,
      :user     => User.new(:scopes => "repo", :whitelisted_repository_ids => ids)
    }
  end

  def context_for_owner_id_whitelist(ids)
    {
      :verb     => :list,
      :resource => Repository.new(:owner_id => 404),
      :user     => User.new(:id => 404, :scopes => "repo", :whitelisted_owner_ids => ids)
    }
  end
end
