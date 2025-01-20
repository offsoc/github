# typed: true

class RuboCop::Cop::GitHub::ZuoraRestVerbs
  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def zuora_rest_verbs?(node); end
end
