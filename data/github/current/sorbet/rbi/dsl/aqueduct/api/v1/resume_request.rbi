# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::ResumeRequest`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::ResumeRequest`.

class Aqueduct::Api::V1::ResumeRequest
  sig { params(app: T.nilable(String), queue: T.nilable(String)).void }
  def initialize(app: nil, queue: nil); end

  sig { returns(String) }
  def app; end

  sig { params(value: String).void }
  def app=(value); end

  sig { void }
  def clear_app; end

  sig { void }
  def clear_queue; end

  sig { returns(String) }
  def queue; end

  sig { params(value: String).void }
  def queue=(value); end
end
