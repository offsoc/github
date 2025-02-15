# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-examples-octocat` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-examples-octocat`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-examples-octocat//lib/monolith-twirp-examples-octocat.rb#9
module Monolith; end

# source://monolith-twirp-examples-octocat//lib/monolith-twirp-examples-octocat.rb#10
module Monolith::Twirp; end

# source://monolith-twirp-examples-octocat//lib/monolith-twirp-examples-octocat.rb#11
module Monolith::Twirp::Examples; end

# source://monolith-twirp-examples-octocat//lib/monolith-twirp-examples-octocat.rb#12
module Monolith::Twirp::Examples::Octocat; end

# source://monolith-twirp-examples-octocat//lib/monolith-twirp-examples-octocat.rb#13
class Monolith::Twirp::Examples::Octocat::Error < ::StandardError; end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/version.rb#4
module MonolithTwirp::Examples; end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/version.rb#5
module MonolithTwirp::Examples::Octocat; end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/v1/octocat_api_pb.rb#20
module MonolithTwirp::Examples::Octocat::V1; end

class MonolithTwirp::Examples::Octocat::V1::GetOctocatRequest
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

class MonolithTwirp::Examples::Octocat::V1::GetOctocatResponse
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

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/v1/octocat_api_twirp.rb#15
class MonolithTwirp::Examples::Octocat::V1::OctocatAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_octocat(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/v1/octocat_api_twirp.rb#9
class MonolithTwirp::Examples::Octocat::V1::OctocatAPIService < ::Twirp::Service; end

# source://monolith-twirp-examples-octocat//lib/monolith_twirp/examples/octocat/version.rb#6
MonolithTwirp::Examples::Octocat::VERSION = T.let(T.unsafe(nil), String)
