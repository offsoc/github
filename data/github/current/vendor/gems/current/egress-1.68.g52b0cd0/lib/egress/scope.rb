module Egress

  # Private: Represents a named scope to limit access in a role.
  class Scope
    attr_reader :name, :description, :parent, :visibility, :no_sudo

    def initialize(attrs = {})
      @name = attrs[:name]
      @description = attrs[:description]
      @parent = attrs[:parent]
      @visibility = attrs[:visibility]
      @no_sudo = attrs[:no_sudo]
      @whitelists = nil
      @children = nil
    end

    def whitelists
      @whitelists ||= {}
    end

    # Public: Define a new whitelist on a scope.
    #
    # method  - The Symbol of a method on a Userish object that will return an
    #           Array of ids that defines this whitelist.
    # options - The Hash of additional options (optional, default: {}).
    #           :method - The method on the target object to be called to
    #                     check against this whitelist. (optional, default: :id).
    # Returns nothing.
    def has_whitelist(method, options = nil)
      options ||= {}
      whitelists[method] = options
    end

    # Public: Define a child scope. Child scopes provide granularity to their
    # parent scope. A request with the parent scope will also match any defined
    # child scopes (and any of their children and so on).
    #
    # name - The String name of the child scope to define.
    #
    # Returns nothing.
    def child_scope(name)
      children << Scope.new(:name => name, :parent => self)
    end

    def allowed_by?(userish, options = nil)
      options ||= {}
      user_scopes = userish.scopes if userish.respond_to? :scopes

      # nil means this user is not restricted to scopes
      return true if user_scopes.nil?

      scopes = []
      scopes << user_scopes
      has_scopes?(scopes) && whitelisted?(userish, options)
    end

    # Public: Boolean if this scope or it's parent scopes contains the
    # requested scopes.
    #
    # scopes - Array of strings scopes.
    #
    # Returns truthy if requested scopes are contained in this scope or its
    # parents.
    def has_scopes?(*scopes)
      scopes.flatten!
      scopes.compact!

      return true if scopes.include?(name)

      parent.nil?? false : parent.has_scopes?(scopes)
    end

    # Public: Array of String scopes that are acceptable for this scope and its
    # parents.
    #
    # Returns an array of Strings.
    def accepted_scopes
      a = [name]
      a << parent.accepted_scopes if parent
      a.flatten.compact
    end

    # Public: Boolean flag if this scope is appropriate for a
    # user to grant.
    def grantable?
      visibility == :grantable
    end

    # Public: Boolean flag if this scope is appropriate for
    # public display.
    def public?
      grantable? || visibility == :public
    end

    # Public: Boolean flag if this scope should be protected
    # by sudo mode.
    def sudo_protected?
      !no_sudo
    end

    private

    # Private: Array of scopes that are children to this scope.
    def children
      @children ||= []
    end

    def whitelisted?(userish, options = nil)
      options ||= {}

      # No target to lookup a whitelist on or no whitelist defined.
      # Not defining a target or whitelist means you aren't using a whitelist.
      return true if options[:target].nil? || options[:whitelist].nil?

      # No whitelist defined to lookup against.
      return false unless whitelist = whitelists[options[:whitelist]]

      method = whitelist[:method] || :id

      # Whitelistable object doesn't have an id (or custom defined :method).
      return false unless options[:target].respond_to?(method) && id = options[:target].send(method)

      if userish.respond_to?(options[:whitelist]) && ids = userish.send(options[:whitelist])
        return true if ids.include?(id)
      end

      false
    end
  end
end
