# typed: true

class RuboCop::Cop::GitHub::StafftoolsInstrumentCalls
  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def github_instrument?(node); end
end
