# typed: true

module RuboCop
  module Cop
    module GitHub
      class NoAliasAttributeWithCoreMethods < Base
        sig { params(node: RuboCop::AST::SendNode, dest: T::Set[Symbol], blk: T.proc.params(arg0: RuboCop::AST::SendNode).void).void }
        def alias_attribute(node, dest:, &blk)
        end
      end
    end
  end
end
