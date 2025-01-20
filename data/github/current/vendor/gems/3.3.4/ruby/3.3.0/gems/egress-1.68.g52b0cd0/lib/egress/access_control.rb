require 'egress/dsl'

module Egress

  # Public: Error raised if a scope check is requested for an undefined scope.
  #
  # Example:
  #   role :blog_writer do |context|
  #     user = extract(context, :user)
  #     user && scope?(user, 'undefined:scope')
  #   end
  #
  # This error will be raised unless there is a explict defintion of the
  # requested scope like this:
  #
  #   scope 'undefined:scope'
  #
  class ScopeError < StandardError; end

  # Public: Error raised if a role is used that has not been defined or has
  # been previously defined.
  #
  # Example:
  #   define_access :delete do |access|
  #     access.allow :blog_deleter
  #   end
  #
  # This error will be raised unless there is a explict defintion of the
  # allowed role like this:
  #
  #   role :blog_deleter
  #
  class RoleError < StandardError; end

  # Public: Error raised if access permissions are checked for an undefined
  # verb.
  #
  # Example:
  #   Egress.access.allowed?(BlogPost, :list_something_not_defined)
  #
  # This error will be raised unless there is an access definition like this
  # on the BlogPost::AccessControl object:
  #
  #   define_access :list_something_not_defined |access|
  #   end
  #
  class AccessVerbError < StandardError; end

  # Public: Provide role based authorization for resources
  #
  # This class is used to define access control for resources which is
  # done by specifying roles and access control permissions for those
  # roles.
  class AccessControl
    extend Egress::DSL
  end
end
