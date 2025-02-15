# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action`.

module Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action::MARKED_AS_ANSWER = 1
Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action::UNKNOWN = 0
Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action::UNMARKED_AS_ANSWER = 2
