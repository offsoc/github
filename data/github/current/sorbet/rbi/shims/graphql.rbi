# typed: strict
# frozen_string_literal: true

class GraphQL::Schema::Enum
  sig { params(context: T.untyped).returns(T::Hash[String, GraphQL::Schema::EnumValue]) }
  def self.values(context = nil); end
end

class GraphQL::Schema::Mutation
  sig { params(args: T.untyped).returns(T.untyped) }
  def before_resolve(**args); end
end
