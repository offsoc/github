# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy`.

module MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy::SORT_BY_INVALID = 0
MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy::SORT_BY_PUBLISHED = 1
MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy::SORT_BY_REVIEWED = 2
MonolithTwirp::AdvisoryDB::Advisories::V1::ListAdvisoriesRequest::RequestOptions::SortBy::SORT_BY_UPDATED = 3
