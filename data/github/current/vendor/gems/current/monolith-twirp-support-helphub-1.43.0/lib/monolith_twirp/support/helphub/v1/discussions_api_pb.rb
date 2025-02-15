# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: helphub/v1/discussions_api.proto

require 'google/protobuf'

require_relative '../../helphub/v1/search_community_forum_hits_item_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("helphub/v1/discussions_api.proto", :syntax => :proto3) do
    add_message "support.helphub.v1.SearchCommunityForumRequest" do
      optional :query, :string, 1
    end
    add_message "support.helphub.v1.FindCommunityDiscussionsByIdsRequest" do
      repeated :ids, :int32, 1
    end
    add_message "support.helphub.v1.SearchCommunityForumResponse" do
      repeated :hits, :message, 1, "support.helphub.v1.SearchCommunityForumHitsItem"
    end
    add_message "support.helphub.v1.FindCommunityDiscussionsByIdsResponse" do
      repeated :hits, :message, 1, "support.helphub.v1.SearchCommunityForumHitsItem"
    end
  end
end

module MonolithTwirp
  module Support
    module HelpHub
      module V1
        SearchCommunityForumRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("support.helphub.v1.SearchCommunityForumRequest").msgclass
        FindCommunityDiscussionsByIdsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("support.helphub.v1.FindCommunityDiscussionsByIdsRequest").msgclass
        SearchCommunityForumResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("support.helphub.v1.SearchCommunityForumResponse").msgclass
        FindCommunityDiscussionsByIdsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("support.helphub.v1.FindCommunityDiscussionsByIdsResponse").msgclass
      end
    end
  end
end
