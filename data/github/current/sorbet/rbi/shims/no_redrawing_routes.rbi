# typed: true

class RuboCop::Cop::GitHub::NoRedrawingRoutes
  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def reload_routes?(node); end

  sig { params(node: RuboCop::AST::Node).returns(T::Boolean) }
  def draw_prepend_append?(node); end
end
