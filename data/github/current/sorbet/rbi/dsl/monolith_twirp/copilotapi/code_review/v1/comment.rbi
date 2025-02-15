# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::CodeReview::V1::Comment`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::CodeReview::V1::Comment`.

class MonolithTwirp::Copilotapi::CodeReview::V1::Comment
  sig do
    params(
      body: T.nilable(String),
      line: T.nilable(Integer),
      path: T.nilable(String),
      side: T.nilable(String),
      start_line: T.nilable(Integer),
      start_side: T.nilable(String)
    ).void
  end
  def initialize(body: nil, line: nil, path: nil, side: nil, start_line: nil, start_side: nil); end

  sig { returns(String) }
  def body; end

  sig { params(value: String).void }
  def body=(value); end

  sig { void }
  def clear_body; end

  sig { void }
  def clear_line; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_side; end

  sig { void }
  def clear_start_line; end

  sig { void }
  def clear_start_side; end

  sig { returns(Integer) }
  def line; end

  sig { params(value: Integer).void }
  def line=(value); end

  sig { returns(String) }
  def path; end

  sig { params(value: String).void }
  def path=(value); end

  sig { returns(String) }
  def side; end

  sig { params(value: String).void }
  def side=(value); end

  sig { returns(Integer) }
  def start_line; end

  sig { params(value: Integer).void }
  def start_line=(value); end

  sig { returns(String) }
  def start_side; end

  sig { params(value: String).void }
  def start_side=(value); end
end
