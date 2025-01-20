# frozen_string_literal: true

require "set"

module Codeowners
  module Matcher
    class Result

      attr_reader :rules_by_path

      def initialize(owner_resolver)
        @owner_resolver = owner_resolver
        @rules_by_path = Hash.new
      end

      def [](path)
        @rules_by_path[path]
      end

      def []=(path, rule)
        @rules_by_path[path] = rule
        owner_resolver.register_owners(rule.owners)
      end

      def rules_by_owner
        @rules_by_owner ||= begin
          result_hash = Hash.new { |hash, key| hash[key] = Set.new } # default to a clean Set
          rules_by_path.values.each_with_object(result_hash) do |rule, by_owner|
            next unless rule

            resolved_owners = resolve_many(rule.owners.filter_map(&:identifier))
            resolved_owners.each { |owner| by_owner[owner] << rule }
          end
          .transform_values(&:sort)
        end
      end

      def owners_by_rule
        return @owners_by_rule if defined?(@owners_by_rule)

        by_owner = rules_by_owner
        owners = by_owner.keys
        rules = by_owner.values.flatten.uniq.sort.reverse_each

        @owners_by_rule = rules.each_with_object({}) do |rule, by_rule|
          by_rule[rule] = owners.select { |owner| by_owner[owner].include?(rule) }
        end
      end

      def paths_for_owner(owner_identifier)
        resolved_owner = owner_resolver.resolve(owner_identifier)

        return [] if resolved_owner.nil?

        rules_by_path.each_with_object([]) do |(path, rule), owned_paths|
          rule_owners = resolve_many(rule.owners.map(&:identifier))
          if rule_owners&.include?(resolved_owner)
            owned_paths << path
          end
        end
      end

      def owners_for_path(path)
        return [] unless path

        @owners_for_path ||= {}

        @owners_for_path[path] ||= begin
          path_owners = rules_by_path[path]&.owners || []

          resolve_many(path_owners.filter_map(&:identifier))
        end
      end

      private
      attr_reader :owner_resolver

      def resolve_many(owner_identifiers)
        if owner_resolver.respond_to?(:resolve_many)
          owner_resolver.resolve_many(owner_identifiers)
        else
          owner_identifiers.filter_map { |owner_id| owner_resolver.resolve(owner_id) }
        end
      end
    end
  end
end
