# frozen_string_literal: true

module Authnd
  module Client
    module Middleware
      module Instrumenters
        class NoopTest < Minitest::Test
          def test_instrument
            ran_block = false
            Noop.instrument("") do
              ran_block = true
            end
            assert ran_block
          end
        end
      end
    end
  end
end
