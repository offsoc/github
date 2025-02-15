# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilot::Users::V1::PRSummarization`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilot::Users::V1::PRSummarization`.

module MonolithTwirp::Copilot::Users::V1::PRSummarization
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Copilot::Users::V1::PRSummarization::PR_SUMMARIZATION_DISABLED = 2
MonolithTwirp::Copilot::Users::V1::PRSummarization::PR_SUMMARIZATION_ENABLED = 1
MonolithTwirp::Copilot::Users::V1::PRSummarization::PR_SUMMARIZATION_INVALID = 0
MonolithTwirp::Copilot::Users::V1::PRSummarization::PR_SUMMARIZATION_NO_POLICY = 4
MonolithTwirp::Copilot::Users::V1::PRSummarization::PR_SUMMARIZATION_UNCONFIGURED = 3
