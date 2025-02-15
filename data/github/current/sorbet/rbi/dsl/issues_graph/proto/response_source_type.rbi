# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssuesGraph::Proto::ResponseSourceType`.
# Please instead update this file by running `bin/tapioca dsl IssuesGraph::Proto::ResponseSourceType`.

module IssuesGraph::Proto::ResponseSourceType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

IssuesGraph::Proto::ResponseSourceType::DENORMALIZED = 1
IssuesGraph::Proto::ResponseSourceType::GRAPH = 0
