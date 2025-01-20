# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        class VersionSpec
          attr_accessor :operator, :version

          def initialize(operator:, version:)
            @operator = operator
            @version = version
          end
        end
      end
    end
  end
end
