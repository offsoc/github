# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: query/v1/scoring_info.proto

require 'google/protobuf'

require 'query/v1/symbol_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("query/v1/scoring_info.proto", :syntax => :proto3) do
    add_message "blackbirdmw.query.v1.ScoringContribution" do
      optional :kind, :enum, 1, "blackbirdmw.query.v1.ScoringFactorKind"
      optional :contribution, :float, 2
    end
    add_message "blackbirdmw.query.v1.MatchScore" do
      optional :score, :float, 1
    end
    add_message "blackbirdmw.query.v1.Snippet" do
      optional :start, :uint32, 1
      optional :end, :uint32, 2
      optional :starting_line_number, :uint32, 3
      optional :ending_line_number, :uint32, 4
      optional :score, :float, 5
    end
    add_message "blackbirdmw.query.v1.ScoringInfo" do
      optional :score, :float, 1
      repeated :factors, :message, 2, "blackbirdmw.query.v1.ScoringContribution"
      repeated :match_scores, :message, 4, "blackbirdmw.query.v1.MatchScore"
      repeated :snippets, :message, 5, "blackbirdmw.query.v1.Snippet"
      repeated :matched_symbols, :message, 6, "blackbirdmw.query.v1.Symbol"
      repeated :enclosing_symbols, :message, 7, "blackbirdmw.query.v1.Symbol"
    end
    add_enum "blackbirdmw.query.v1.ScoringFactorKind" do
      value :SCORING_FACTOR_KIND_UNSPECIFIED, 0
      value :SCORING_FACTOR_KIND_REPO_SCORE, 1
      value :SCORING_FACTOR_KIND_IS_TEST, 2
      value :SCORING_FACTOR_KIND_IS_VENDORED, 3
      value :SCORING_FACTOR_KIND_MATCH_DENSITY, 4
      value :SCORING_FACTOR_KIND_LANGUAGE_TYPE, 5
      value :SCORING_FACTOR_KIND_IS_GENERATED, 6
      value :SCORING_FACTOR_KIND_MATCH_COMPLETENESS, 7
      value :SCORING_FACTOR_KIND_LANGUAGE_CONTEXT, 8
      value :SCORING_FACTOR_KIND_FILENAME_SCORE, 9
      value :SCORING_FACTOR_KIND_COVERING_SCORE, 10
      value :SCORING_FACTOR_KIND_REF_SCORE, 11
      value :SCORING_FACTOR_KIND_IS_BOILERPLATE, 12
      value :SCORING_FACTOR_KIND_CROWDING, 13
      value :SCORING_FACTOR_KIND_HYBRID_EMBEDDING, 14
      value :SCORING_FACTOR_KIND_HYBRID_KEYWORD, 15
    end
  end
end

module Blackbird
  module Query
    module V1
      ScoringContribution = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.query.v1.ScoringContribution").msgclass
      MatchScore = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.query.v1.MatchScore").msgclass
      Snippet = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.query.v1.Snippet").msgclass
      ScoringInfo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.query.v1.ScoringInfo").msgclass
      ScoringFactorKind = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.query.v1.ScoringFactorKind").enummodule
    end
  end
end
