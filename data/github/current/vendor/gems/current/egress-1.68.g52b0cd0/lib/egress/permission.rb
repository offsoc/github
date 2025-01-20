require 'egress/access_grant'

module Egress
  # Private: Represents access permissions defined for a resource.
  class Permission
    def initialize(auth)
      @auth = auth
      @checks = []
      @required_keys = []
      @required_blocks = []
    end

    def allow(role, &block)
      checks << [role, block]
    end

    def ensure_context(*keys, &block)
      if block_given?
        required_blocks << [keys, block]
      else
        required_keys.push(*keys)
      end
    end

    def grant_for?(context)
      grant = AccessGrantBuilder.new(context)

      return grant.build unless pre_conditions_met?(context)
      return grant.build(access_granted: true) if checks.empty?

      checks.each do |role, condition|
        raise RoleError, "Role '#{role}' not defined." unless (r = @auth.roles[role])

        if !condition || condition.call(context)
          grant.registered_roles << r
          grant.matched_roles << r if r.has_access?(grant)
        end
      end

      grant.build
    end

    private

    attr_reader :checks, :required_keys, :required_blocks

    def pre_conditions_met?(context)
      return false if required_keys.any? { |key| context[key].nil? }

      required_blocks.all? do |(keys, block)|
        block.call(*keys.map { |key| context[key] })
      end
    end
  end
end
