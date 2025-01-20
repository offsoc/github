# typed: strict
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Ruleset
      extend T::Sig

      sig do
        params(
          source: RuleEngine::Types::RuleSource,
          name: T.nilable(String),
          target: T.nilable(Symbol),
          enforcement: T.nilable(Symbol),
          target_all: T.nilable(T::Boolean),
        ).returns(RepositoryRuleset)
      end
      def self.create(source:, name: nil, target: :branch, enforcement: :disabled, target_all: false)
        name ||= "#{source.class.name} rule (#{SecureRandom.hex})"
        ruleset = RepositoryRuleset.create!(
          source:,
          name:,
          target:,
          enforcement:
        )

        if target_all
          conditions = T.let([{
            target: "ref_name",
            parameters: { exclude: [], include: ["~ALL"] }
          }], T::Array[{ target: String, parameters: T.untyped }])
          conditions << {
            target: "repository_name", parameters: { exclude: [], include: ["~ALL"] }
          } if source.class.name == "Organization"
          ruleset.upsert_conditions(conditions)
          ruleset
        end

        ruleset
      end

      sig do
        params(ruleset: RepositoryRuleset, bypass_actors: T::Array[{
          actor_id: Integer,
          actor_type: String,
          bypass_mode: T.nilable(Symbol),
        }]).void
      end
      def self.add_bypass_actors(ruleset, bypass_actors)
        ruleset.upsert_bypass_actors(bypass_actors)
      end

      sig { params(ruleset: RepositoryRuleset, extensions: T::Array[String]).void }
      def self.block_file_extensions(ruleset, extensions)
        add_rule(ruleset, "file_extension_restriction", { restricted_file_extensions: extensions })
      end

      sig { params(ruleset: RepositoryRuleset, max_length: Integer).void }
      def self.block_file_path_lengths(ruleset, max_length)
        add_rule(ruleset, "max_file_path_length", { max_file_path_length: max_length })
      end

      sig { params(ruleset: RepositoryRuleset, rule_type: String, parameters: T.untyped).void }
      def self.add_rule(ruleset, rule_type, parameters)
        ruleset.upsert_rules([{
          rule_type:,
          parameters:,
        }])
      end

      sig { params(ruleset: RepositoryRuleset, repository: ::Repository).void }
      def self.add_repo_condition(ruleset, repository)
        ruleset.upsert_conditions([{
          target: "repository_id",
          parameters: { repository_ids: [repository.global_relay_id] }
        }])
      end
    end
  end
end
