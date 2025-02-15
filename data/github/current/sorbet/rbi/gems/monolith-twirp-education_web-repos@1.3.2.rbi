# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-education_web-repos` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-education_web-repos`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-education_web-repos//lib/monolith-twirp-education_web-repos.rb#7
module Monolith; end

# source://monolith-twirp-education_web-repos//lib/monolith-twirp-education_web-repos.rb#8
module Monolith::Twirp; end

# source://monolith-twirp-education_web-repos//lib/monolith-twirp-education_web-repos.rb#9
module Monolith::Twirp::EducationWeb; end

# source://monolith-twirp-education_web-repos//lib/monolith-twirp-education_web-repos.rb#10
module Monolith::Twirp::EducationWeb::Repos; end

# source://monolith-twirp-education_web-repos//lib/monolith-twirp-education_web-repos.rb#11
class Monolith::Twirp::EducationWeb::Repos::Error < ::StandardError; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/version.rb#4
module MonolithTwirp::EducationWeb; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/version.rb#5
module MonolithTwirp::EducationWeb::Repos; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/v1/classroom_repos_api_pb.rb#23
module MonolithTwirp::EducationWeb::Repos::V1; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/v1/classroom_repos_api_twirp.rb#15
class MonolithTwirp::EducationWeb::Repos::V1::ClassroomReposAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_classroom_repo_info(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/v1/classroom_repos_api_twirp.rb#9
class MonolithTwirp::EducationWeb::Repos::V1::ClassroomReposAPIService < ::Twirp::Service; end

class MonolithTwirp::EducationWeb::Repos::V1::GetClassroomRepoInfoRequest
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

class MonolithTwirp::EducationWeb::Repos::V1::GetClassroomRepoInfoResponse
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

class MonolithTwirp::EducationWeb::Repos::V1::GetRepoInfoRequest
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

class MonolithTwirp::EducationWeb::Repos::V1::GetRepoInfoResponse
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

class MonolithTwirp::EducationWeb::Repos::V1::RepoInfo
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

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/v1/repos_api_twirp.rb#15
class MonolithTwirp::EducationWeb::Repos::V1::ReposAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_repo_info(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/v1/repos_api_twirp.rb#9
class MonolithTwirp::EducationWeb::Repos::V1::ReposAPIService < ::Twirp::Service; end

# source://monolith-twirp-education_web-repos//lib/monolith_twirp/education_web/repos/version.rb#6
MonolithTwirp::EducationWeb::Repos::VERSION = T.let(T.unsafe(nil), String)
