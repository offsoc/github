# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-features-groups` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-features-groups`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-features-groups//lib/monolith-twirp-features-groups.rb#7
module Monolith; end

# source://monolith-twirp-features-groups//lib/monolith-twirp-features-groups.rb#8
module Monolith::Twirp; end

# source://monolith-twirp-features-groups//lib/monolith-twirp-features-groups.rb#9
module Monolith::Twirp::Features; end

# source://monolith-twirp-features-groups//lib/monolith-twirp-features-groups.rb#10
module Monolith::Twirp::Features::Groups; end

# source://monolith-twirp-features-groups//lib/monolith-twirp-features-groups.rb#11
class Monolith::Twirp::Features::Groups::Error < ::StandardError; end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/version.rb#4
module MonolithTwirp::Features; end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/version.rb#5
module MonolithTwirp::Features::Groups; end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/v1/groups_api_pb.rb#19
module MonolithTwirp::Features::Groups::V1; end

class MonolithTwirp::Features::Groups::V1::GetGroupsRequest
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

class MonolithTwirp::Features::Groups::V1::GetGroupsResponse
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

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/v1/groups_api_twirp.rb#15
class MonolithTwirp::Features::Groups::V1::GroupsAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_groups(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/v1/groups_api_twirp.rb#9
class MonolithTwirp::Features::Groups::V1::GroupsAPIService < ::Twirp::Service; end

# source://monolith-twirp-features-groups//lib/monolith_twirp/features/groups/version.rb#6
MonolithTwirp::Features::Groups::VERSION = T.let(T.unsafe(nil), String)
