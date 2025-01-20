# Egress

Egress is a library for defining access control and permissions to resources.
It includes some of the basic concepts from OAuth like scopes making it easy
to use as a central place for defining access control and permission in your
codebase. Egress is concerned with [authorization][authz] and not with
[authentication][authn].

[authz]: http://en.wikipedia.org/wiki/Authorization
[authn]: http://en.wikipedia.org/wiki/Authentication

## Basic Usage

You define access control on the model level by creating roles, and then
defining which resources can be accessed by those roles. Access to a resource
is defined with an arbitrary verb. For instance, listing the BlogPost resource
might use the verb `:list_posts` or even just `:list`.

``` ruby
class Repository::AccessControl < Egress::AccessControl
  # Literally
  role :everyone

  # A user who has pull access to the given repo
  role :repo_puller do |context|
    user, repo = extract(context, :user, :resource)
    user && repo.pullable_by?(user)
  end

  # Define who can list watchers on this particular resource (a repository)
  # In this case :everyone can list watchers on public repos, otherwise only
  # users with pull access can list watchers on a particular repo
  define_access :list_watchers do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_puller
  end
end
```

## Scopes

Egress also includes the concept of scopes which are tied closely to the idea
of OAuth scopes. A scope allows you to refine access within a role and is
often used when a user is being impersonated by a third party application.
Scopes provide granularity and access limitations so that users can give third
party applications only the permission they absolutely need.

Scopes can also be nested allowing easy declaration of this permission grant.
For instance if a user makes a request with the full `user` scope, they should
also be able to perform roles that require the less permissive `user:read`
scope. You could say that the `user` scope includes `user:reader`.


``` ruby
class BlogPostComment::AccessControl < Egress::AccessControl
  scope "user"
  scope "user:read", :parent => "user"

  role :comment_reader, :scope => "user:read" do |context|
    user = extract(context, :user)
    user
  end

  role :comment_writer do |context|
    user = extract(context, :user)
    user && scope?(user, "user")
  end
end
```

## Developing

- Clone the project into your github/github Codespace: `gh repo clone github/egress /workspaces/egress`
- Point the [Gemfile](https://github.com/github/github/blob/944a4dc880cee2ead6e9646af54f89569da2d4f2/Gemfile#L78) to the local clone of Egress: `gem "egress", path: "/workspaces/egress"`
- Run `script/bootstrap` to make github/github aware of the new location of Egress
- Make changes to the code in `/workspaces/egress` and see them reflected in github/github
- Run the unit tests for Egress with `rake test`


## Release process

- Bump the version in the .gemspec file
  - We use an incrementing integer because this gem is only used in `github/github` and we don't currently need the ceremony of semver
- Create a new tag, using the version number as the tag name
- Follow the [instructions for updating vendored gems into github/github](https://thehub.github.com/epd/engineering/products-and-services/dotcom/development-environment/#from-git)
