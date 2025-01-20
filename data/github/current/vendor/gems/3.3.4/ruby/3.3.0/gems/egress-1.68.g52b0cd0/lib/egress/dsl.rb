require 'ostruct'
require 'egress/context_wrapper'
require 'egress/permission'
require 'egress/role'
require 'egress/scope'

module Egress
  module DSL
    def permissions
      @permissions ||= {}
    end

    def roles
      @roles ||= {}
    end

    def scopes
      @scopes ||= {}
    end

    # Public: Define a named scope. Scopes are used to limit access for a user
    # in a role. Generally this is done because someone is impersonating a
    # user in order to access a resource (OAuth).
    #
    # name    - The String name of the scope.
    # options - A Hash of additional options (optional).
    #           :parent         - The String parent scope, that includes this
    #                             scope's access rights (optional).
    #           :description    - String human description of this scope.
    #           :visibility     - A Symbol denoting the visibility of this scope
    #                            (optional). By default, scopes are accessible,
    #                            but private. Valid values are:
    #                            :public    - Boolean flag if this scope is
    #                                         suitable to be revealed publically.
    #                            :grantable - Boolean flag if users can grant
    #                                         this scope. Grantable scopes are
    #                                         always public too.
    #           :no_sudo        - A Boolean flag if this scope should not be
    #                             protected by sudo mode to grant (optional,
    #                             default: false).
    #
    # Returns nothing.
    def scope(name, options = nil)
      options ||= {}

      if parent = options[:parent] && scopes[options[:parent]]
        parent.child_scope(name)
      end
      scopes[name] = Scope.new(options.merge({:name => name, :parent => parent}))

      if block_given?
        yield scopes[name]
      end
    end

    # Public: Normalizes a given set of scopes. By default, normalizes to a set
    # of scopes that are grantable.
    #
    # names   - A String of comma-separated scopes. Optionally an Array of
    #           String scopes.
    # options - A Hash of additional options (optional).
    #           :visibility - Normalize to the specified visibility:
    #                         :grantable - Filter by scopes that are grantable (default).
    #                         :public    - Filter by scopes that are public.
    #                         :all       - All scopes.
    #
    # Returns an Array of scope names.
    def normalize_scopes(names, options = nil)
      options ||= {}

      allowed = case options[:visibility]
                when :all
                  acceptable_scope_names
                when :public
                  public_scope_names
                else
                  grantable_scope_names
                end

      if names.is_a?(Array)
        names = names.flatten.join(",")
      end

      # Clean, dedupe, filter.
      names = names.to_s.split(/,|\A|\s/).delete_if do |name|
        name.strip!
        name.downcase!
        name.nil? || name.empty? || !allowed.include?(name)
      end.uniq.sort

      # Remove any scopes that are covered by other scopes in the list.
      names = names.delete_if do |name|
        accepted = scopes[name].accepted_scopes
        exists = (names - [name]) & accepted
        exists.size > 0
      end

      names
    end

    # Public A Hash of acceptable Scopes.
    alias_method :acceptable_scopes, :scopes

    # Public: A String array of acceptable, registered scopes.
    def acceptable_scope_names
      scopes.keys.sort
    end

    # Public A Hash of grantable Scopes.
    def grantable_scopes
      scopes.reject{ |k, v| !v.grantable? }
    end

    # Public: A String array of acceptable, registered scopes that are
    # appropriate for a user to grant.
    def grantable_scope_names
      grantable_scopes.keys.sort
    end

    # Public A Hash of public Scopes.
    def public_scopes
      scopes.reject{ |k, v| !v.public? }
    end

    # Public: A String array of acceptable, registered scopes that are
    # appropriate to display publically (Usually a superset of #public_scopes).
    def public_scope_names
      public_scopes.keys.sort
    end

    # Public A Hash of sudo protected Scopes.
    def sudo_protected_scopes
      scopes.reject{ |k, v| !v.sudo_protected? }
    end

    # Public: A String array of scopes that should be protected by sudo_mode
    def sudo_protected_scope_names
      sudo_protected_scopes.keys.sort
    end

    # Public: Define a role to be used for access control.
    #
    # name    - A String that is the name of this role (must be unique).
    # options - An options Hash.
    #           :depends_on - An Array of other roles this role depends on
    # block   - A block to be evaluated that defines this role. This block
    #           should return true if the current request meets the role criteria,
    #           otherwise false.
    #
    # Returns nothing.
    def role(name, options = nil, &block)
      raise RoleError, "Role #{name} already defined" if roles.key?(name)
      options ||= {}
      options.merge!(:access_control => self, :name => name)
      roles[name] = Role.new(options, &block)
    end

    # Public: Define access policy for a resource that was specified in
    # control_access(Resource)
    #
    # verbs - A symbol (or Array of symbols) specifying the verbs that
    #         access is to be defined for.
    #
    # Returns nothing
    def define_access(*verbs)
      return unless block_given?
      verbs.each do |verb|
        yield permissions[verb] = Permission.new(self)
      end
    end

    # Public: Check if a Userish object has the proper scope.
    #
    # userish - An object that responds to #scopes.
    # scope   - The String scope to check against the scopes on userish.
    # options - The Hash of addition options for scope checking (optional).
    #           :target    - An object that responds to :method. Implies that your
    #                        userish object responds to the methods you've
    #                        defined on your whitelist.
    #           :method    - The method that returns the FixNum to be checked
    #                        against the whitelist. Defaults to :id.
    #           :whitelist - The Symbol name of a whitelist you've defined for
    #                        this scope.
    #
    # Returns truthy if this user has the specified scope.
    def scope?(userish, scope, options = nil)
      options ||= {}

      unless scopes.include?(scope)
        raise ScopeError, "Scope '#{scope}' not defined."
      end
      scopes[scope].allowed_by?(userish, options)
    end

    # Public: Determines if access is allowed to the specified resource based
    # on defined access permissions and roles. You can setup permissions for a
    # resource like this:
    #
    # role :everyone
    #
    # role :user do |context|
    #   user = extract(context, :user)
    #   user && scope?(user, 'repo')
    # end
    #
    # define_access :create do |access|
    #   access.allow :user
    # end
    #
    # context - A Hash with the following keys:
    #           verb     - Symbol. The action being performed on the...
    #           resource - Object that access to is being controled.
    #           ...      - Any other object that is required in role
    #                      definitions to determine access rights.
    #
    # Returns true if access is allowed, otherwise false.
    def access_allowed?(context)
      access_grant(context).access_allowed?
    end

    # Public: Determines if access is allowed to the specified resource based
    # on defined access permissions and roles. You can setup permissions for a
    # resource like this:
    #
    # role :everyone
    #
    # role :user do |context|
    #   user = extract(context, :user)
    #   user && scope?(user, 'repo')
    # end
    #
    # define_access :create do |access|
    #   access.allow :user
    # end
    #
    # context - A Hash with the following keys:
    #           verb     - Symbol. The action being performed on the...
    #           resource - Object that access to is being controled.
    #           ...      - Any other object that is required in role
    #                      definitions to determine access rights.
    #
    # Returns an AccessGrant object.
    def access_grant(context)
      unless context
        raise ArgumentError, "The argument context cannot be nil."
      end
      unless verb = context[:verb]
        raise ArgumentError, "The key :verb was not found in the argument context."
      end
      unless perms = permissions[verb]
        raise AccessVerbError, "No access permission defined for '#{verb}'."
      end
      perms.grant_for?(ContextWrapper.new(context))
    end

    # Public: Extract objects from the access control context.
    #
    # context - A Hash that is the access control context.
    # keys    - One or more keys to extract from the context.
    #
    # Returns an Array of objects for the specified keys or a single object if
    # only one key is specified. Returns nil if context is nil.
    def extract(context, *keys)
      return nil if context.nil?

      a = []
      keys.each do |key|
        a << context[key]
      end
      a.count == 1 ? a.first : a
    end
  end
end
