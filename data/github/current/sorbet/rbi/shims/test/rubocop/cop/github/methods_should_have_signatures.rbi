# typed: true

module RuboCop
  module Cop
    module GitHub
      class MethodsShouldHaveSignatures < Base
        sig { params(node: T.nilable(RuboCop::AST::Node)).returns(T.nilable(T::Boolean)) }
        def extend_t_sig_call?(node); end

        sig { params(node: T.nilable(RuboCop::AST::Node)).returns(T.nilable(T::Boolean)) }
        def sig_block?(node); end

        sig { params(node: T.nilable(RuboCop::AST::Node)).returns(T.nilable(T::Boolean)) }
        def private_method_boundary?(node); end
      end
    end
  end
end
