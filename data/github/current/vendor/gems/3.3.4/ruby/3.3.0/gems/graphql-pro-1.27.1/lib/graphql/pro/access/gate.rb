# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      # A Gate may sit in a type or field's metadata for each `level`.
      # It contains the authorization requirements for that level.
      class Gate
        # @return [Symbol] `:view`, `:access`, or `:authorize`
        attr_reader :level
        attr_reader :role, :parent_gate

        # For parent gates, this is assigned later
        attr_accessor :owner

        def initialize(owner:, level:, role:, parent_gate:, pundit_policy_name: nil)
          @owner = owner
          @level = level
          @role = role
          @parent_gate = parent_gate

          @explicit_pundit_policy_name = pundit_policy_name
          @has_pundit_policy = false
          @pundit_policy = nil
        end

        # Build the default name lazily, if needed
        def pundit_policy_name
          @pundit_policy_name ||= begin
            name = if @explicit_pundit_policy_name
              @explicit_pundit_policy_name
            else
              case @owner
              when GraphQL::Field
                "#{@owner.type.unwrap.name}#{Pundit::SUFFIX}"
              when GraphQL::BaseType
                "#{@owner.name}#{Pundit::SUFFIX}"
              else
                raise "Unexpected gate owner: #{@owner.inspect}"
              end
            end

            if self.class.pundit_namespace
              name = "#{self.class.pundit_namespace}::#{name}"
            end

            name
          end
        end

        def pundit_policy
          if !@has_pundit_policy
            @has_pundit_policy = true
            @pundit_policy = begin
              Object.const_get(pundit_policy_name)
            rescue NameError
              nil
            end
          end

          @pundit_policy
        end

        class << self
          # Only one namespace is supported, since this is shared
          # @api private
          attr_accessor :pundit_namespace
        end

        def self.build(owner, level, spec)
          case spec
          when Symbol, String
            self.build(owner, level, {role: spec})
          when Hash
            own_role = spec[:role]
            parent_role = spec[:parent_role]
            if own_role.nil? && parent_role.nil?
              raise InvalidConfigurationError, "Must provide either `role:` or `parent_role:` for #{owner} `#{level}`"
            end
            if parent_role && (level == :view || level == :access)
              raise InvalidConfigurationError, "Can't provide `parent_role:` with `#{level.inspect}`; `parent_role:` requires the runtime object, so it must be used with `authorize:`."
            end
            parent_gate = if parent_role
              GraphQL::Pro::Access::Gate.new(
                owner: nil, # Assigned later
                level: level,
                role: parent_role,
                parent_gate: nil,
                pundit_policy_name: spec[:parent_pundit_policy_name]
              )
            else
              nil
            end
            GraphQL::Pro::Access::Gate.new(
              owner: owner,
              level: level,
              role: own_role,
              parent_gate: parent_gate,
              pundit_policy_name: spec[:pundit_policy_name]
            )
          else
            raise("Unexpected #{level.inspect} => #{spec.inspect} (expected String, Symbol, Hash)")
          end
        end
      end
    end
  end
end
