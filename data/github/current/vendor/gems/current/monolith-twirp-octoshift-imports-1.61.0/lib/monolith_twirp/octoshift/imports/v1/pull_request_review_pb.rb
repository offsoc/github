# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: imports/v1/pull_request_review.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("imports/v1/pull_request_review.proto", :syntax => :proto3) do
    add_message "octoshift.imports.v1.PullRequestReview" do
      optional :id, :int64, 1
      repeated :review_threads, :message, 2, "octoshift.imports.v1.PullRequestReviewThreadResponse"
      repeated :review_comments, :message, 3, "octoshift.imports.v1.PullRequestReviewCommentResponse"
    end
    add_message "octoshift.imports.v1.PullRequestReviewThreadResponse" do
      optional :id, :int64, 1
      repeated :review_comments, :message, 2, "octoshift.imports.v1.PullRequestReviewCommentResponse"
    end
    add_message "octoshift.imports.v1.PullRequestReviewCommentResponse" do
      optional :id, :int64, 1
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        PullRequestReview = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.PullRequestReview").msgclass
        PullRequestReviewThreadResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.PullRequestReviewThreadResponse").msgclass
        PullRequestReviewCommentResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.PullRequestReviewCommentResponse").msgclass
      end
    end
  end
end
