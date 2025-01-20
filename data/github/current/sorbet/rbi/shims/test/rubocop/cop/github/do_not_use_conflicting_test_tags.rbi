# typed: true

module RuboCop
  module Cop
    module GitHub
      class DoNotUseConflictingTestTags < Base
        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def test_or_context_block?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def skip_enterprise_called?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def enterprise_only_called?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def skip_when_spammy_called?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def spammy_only_called?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def es_5_only_called?(node)
        end

        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def es_8_only_called?(node)
        end
      end
    end
  end
end
