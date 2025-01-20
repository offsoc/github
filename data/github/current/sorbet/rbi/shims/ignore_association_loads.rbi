# typed: true

class RuboCop::Cop::GitHub::IgnoreAssociationLoads
  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def ignore_association_loads?(node); end
end
