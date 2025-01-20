# typed: true

module RuboCop
  module Cop
    module GitHub
      class FullTrust < Base
        sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
        def github_full_trust?(node)
        end
      end
    end
  end
end
