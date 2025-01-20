# frozen_string_literal: true

module Egress
  # Public: Defines the actual roles, scopes and permissions that were
  # granted (if any).
  class AccessGrant
    attr_reader :verb, :matched_roles, :registered_roles

    def initialize(access_granted, options = nil)
      options ||= {}

      @access_allowed = access_granted
      @verb = options[:verb]
      @matched_roles = options[:matched_roles] || []
      @registered_roles = options[:registered_roles] || []
    end

    def access_allowed?
      @access_allowed
    end

    def matched_role_names
      matched_roles.map(&:name)
    end

    def accepted_scopes
      registered_roles.map(&:accepted_scopes).flatten.compact
    end
  end

  # TODO: remove all of these
  # Private: Legacy accessors for the context hash.
  module LegacyAccessors
    def integration
      context[:integration]
    end

    def user
      context[:user]
    end

    def member
      context[:member]
    end

    def asset
      context[:asset]
    end

    def target
      context[:target]
    end
  end

  # Private: Collect Role results to find matched roles and build an AccessGrant object.
  class AccessGrantBuilder
    attr_reader :context
    private :context

    include LegacyAccessors

    def initialize(context)
      @context = context
      @verb = context[:verb]
    end

    def actors(*_types)
      result = yield

      throw(:answer, result) unless result.nil?
    end

    def [](key)
      context[key]
    end

    def matched_roles
      @matched_roles ||= []
    end

    def registered_roles
      @registered_roles ||= []
    end

    def access_granted
      @always_grant || !matched_roles.empty?
    end

    # Build up an AccessGrant object.
    #
    # Returns a new AccessGrant.
    def build(options = nil)
      options ||= {}

      @always_grant = options[:access_granted]
      AccessGrant.new(
        access_granted,
        verb: @verb,
        matched_roles: matched_roles,
        registered_roles: registered_roles
      )
    end
  end
end
