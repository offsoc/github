# frozen_string_literal: true
# typed: true

# because PrivateRelationWhereChain extends PrivateRelation
# which extends ActiveRecord::Relation, and the problem is
# Sorbet doesn't know that LikeQuery has also been added to
# that as well as ActiveRecord::Base (in config/initializers/activerecord_like_query.rb)
# we add a shim here
class ::ActiveRecord::Relation
  include LikeQuery

  sig do
    params(
      param: Symbol,
      values: T::Enumerable[T.untyped],
      batch_size: T.nilable(Integer),
      context: T.untyped,
      load_async: T::Boolean,
      block: T.nilable(T.proc.params(arg0: T.untyped).returns(T.untyped)),
    ).returns(GitHub::BatchedScope::BatchedScopeQuery[T.untyped])
  end
  def batched_scope(param, values:, batch_size: nil, context: nil, load_async: false, &block); end
end
