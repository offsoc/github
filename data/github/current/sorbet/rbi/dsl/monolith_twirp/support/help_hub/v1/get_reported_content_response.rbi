# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Support::HelpHub::V1::GetReportedContentResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Support::HelpHub::V1::GetReportedContentResponse`.

class MonolithTwirp::Support::HelpHub::V1::GetReportedContentResponse
  sig do
    params(
      reported_content: T.nilable(String),
      reported_content_id: T.nilable(Integer),
      reported_content_type: T.nilable(String)
    ).void
  end
  def initialize(reported_content: nil, reported_content_id: nil, reported_content_type: nil); end

  sig { void }
  def clear_reported_content; end

  sig { void }
  def clear_reported_content_id; end

  sig { void }
  def clear_reported_content_type; end

  sig { returns(String) }
  def reported_content; end

  sig { params(value: String).void }
  def reported_content=(value); end

  sig { returns(Integer) }
  def reported_content_id; end

  sig { params(value: Integer).void }
  def reported_content_id=(value); end

  sig { returns(String) }
  def reported_content_type; end

  sig { params(value: String).void }
  def reported_content_type=(value); end
end
