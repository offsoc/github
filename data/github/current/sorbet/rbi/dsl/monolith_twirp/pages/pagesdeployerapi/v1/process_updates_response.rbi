# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Pages::Pagesdeployerapi::V1::ProcessUpdatesResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Pages::Pagesdeployerapi::V1::ProcessUpdatesResponse`.

class MonolithTwirp::Pages::Pagesdeployerapi::V1::ProcessUpdatesResponse
  sig { params(message: T.nilable(String), status: T.nilable(String)).void }
  def initialize(message: nil, status: nil); end

  sig { void }
  def clear_message; end

  sig { void }
  def clear_status; end

  sig { returns(String) }
  def message; end

  sig { params(value: String).void }
  def message=(value); end

  sig { returns(String) }
  def status; end

  sig { params(value: String).void }
  def status=(value); end
end
