module Egress

  # Private: Represents a role that can be used to limit access to a resource.
  class Role
    attr_reader :access_control, :name, :dependents, :scope, :role

    def initialize(options = nil, &block)
      options ||= {}

      @access_control = options[:access_control]
      @dependents = options[:depends_on] || []
      @scope = [options[:scope] || []].flatten
      @name = options[:name]
      @role = block ? block : Proc.new { true }
    end

    # Public: Array of string scopes acceptable for this role.
    #
    # Returns an array of strings.
    def accepted_scopes
      scope.map { |s| access_control.scopes[s].accepted_scopes }.flatten.compact
    end

    # Private: Check if this role has access to the context.
    #
    # context - The Hash context.
    #
    # Returns truthy if the role has access.
    def has_access?(context)
      return false if dependents.any? do |dependent|
        unless dependent_role = access_control.roles[dependent]
          raise RoleError, "Role '#{dependent}' not defined."
        end
        !dependent_role.has_access?(context)
      end

      answer = catch(:answer) do
        role.call(context)
      end

      answer && has_scope?(context)
    end

    # Private: Check if the context has an appropriate scope.
    #
    # Returns truthy if the context has the appropriate scope.
    def has_scope?(context)
      return true unless context && scope.size > 0

      context[:user] && scope.any? { |s| access_control.scope?(context[:user], s) }
    end
  end
end
