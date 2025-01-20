# typed: true

module RuboCop
  module Cop
    module GitHub
      class PublicResource < Base
        sig { params(node: RuboCop::AST::SendNode).returns(T::Boolean) }
        def public_resource_new?(node)
        end
      end
    end
  end
end
