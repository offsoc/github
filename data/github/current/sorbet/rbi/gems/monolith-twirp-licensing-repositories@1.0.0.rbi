# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-licensing-repositories` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-licensing-repositories`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-licensing-repositories//lib/monolith-twirp-licensing-repositories.rb#7
module Monolith; end

# source://monolith-twirp-licensing-repositories//lib/monolith-twirp-licensing-repositories.rb#8
module Monolith::Twirp; end

# source://monolith-twirp-licensing-repositories//lib/monolith-twirp-licensing-repositories.rb#9
module Monolith::Twirp::Licensing; end

# source://monolith-twirp-licensing-repositories//lib/monolith-twirp-licensing-repositories.rb#10
module Monolith::Twirp::Licensing::Repositories; end

# source://monolith-twirp-licensing-repositories//lib/monolith-twirp-licensing-repositories.rb#11
class Monolith::Twirp::Licensing::Repositories::Error < ::StandardError; end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/version.rb#4
module MonolithTwirp::Licensing; end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/version.rb#5
module MonolithTwirp::Licensing::Repositories; end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_pb.rb#37
module MonolithTwirp::Licensing::Repositories::V1; end

class MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationRequest
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

class MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationResponse
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

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_twirp.rb#15
class MonolithTwirp::Licensing::Repositories::V1::RepositoriesAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_repository_information(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_twirp.rb#9
class MonolithTwirp::Licensing::Repositories::V1::RepositoriesAPIService < ::Twirp::Service; end

class MonolithTwirp::Licensing::Repositories::V1::Repository
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

module MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_pb.rb#39
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_INTERNAL = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_pb.rb#39
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_INVALID = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_pb.rb#39
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_PRIVATE = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/v1/repositories_api_pb.rb#39
MonolithTwirp::Licensing::Repositories::V1::Repository::Visibility::VISIBILITY_PUBLIC = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-licensing-repositories//lib/monolith_twirp/licensing/repositories/version.rb#6
MonolithTwirp::Licensing::Repositories::VERSION = T.let(T.unsafe(nil), String)
