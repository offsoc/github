# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      class Packages
        attr_reader :apply

        def initialize(apply:)
          @apply = apply
        end

        def build_migrator(migration_run_id)
          Migration.new(apply: apply, migration_run_id: migration_run_id)
        end
      end
    end
  end
end
