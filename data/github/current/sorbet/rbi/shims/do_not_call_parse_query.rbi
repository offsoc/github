# typed: true

class RuboCop::Cop::GitHub::DoNotCallParseQuery
  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def parse_query?(node); end
end
