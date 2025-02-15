# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-code_scanning-suggested_fixes` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-code_scanning-suggested_fixes`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith-twirp-code_scanning-suggested_fixes.rb#7
module Monolith; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith-twirp-code_scanning-suggested_fixes.rb#8
module Monolith::Twirp; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith-twirp-code_scanning-suggested_fixes.rb#9
module Monolith::Twirp::CodeScanning; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith-twirp-code_scanning-suggested_fixes.rb#10
module Monolith::Twirp::CodeScanning::SuggestedFixes; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith-twirp-code_scanning-suggested_fixes.rb#11
class Monolith::Twirp::CodeScanning::SuggestedFixes::Error < ::StandardError; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/version.rb#4
module MonolithTwirp::CodeScanning; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/version.rb#5
module MonolithTwirp::CodeScanning::SuggestedFixes; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/v1/suggested_fixes_pb.rb#21
module MonolithTwirp::CodeScanning::SuggestedFixes::V1; end

class MonolithTwirp::CodeScanning::SuggestedFixes::V1::SuggestedFixStateChangedRequest
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class MonolithTwirp::CodeScanning::SuggestedFixes::V1::SuggestedFixStateChangedResponse
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/v1/suggested_fixes_twirp.rb#15
class MonolithTwirp::CodeScanning::SuggestedFixes::V1::SuggestedFixesAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def suggested_fix_state_changed(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/v1/suggested_fixes_twirp.rb#9
class MonolithTwirp::CodeScanning::SuggestedFixes::V1::SuggestedFixesAPIService < ::Twirp::Service; end

# source://monolith-twirp-code_scanning-suggested_fixes//lib/monolith_twirp/code_scanning/suggested_fixes/version.rb#6
MonolithTwirp::CodeScanning::SuggestedFixes::VERSION = T.let(T.unsafe(nil), String)
