# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `monolith-twirp-proxima-enterprisemanagement` gem.
# Please instead update this file by running `bin/tapioca gem monolith-twirp-proxima-enterprisemanagement`.

module Google::Protobuf::MessageExts::ClassMethods; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith-twirp-proxima-enterprisemanagement.rb#7
module Monolith; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith-twirp-proxima-enterprisemanagement.rb#8
module Monolith::Twirp; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith-twirp-proxima-enterprisemanagement.rb#9
module Monolith::Twirp::Proxima; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith-twirp-proxima-enterprisemanagement.rb#10
module Monolith::Twirp::Proxima::Enterprisemanagement; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith-twirp-proxima-enterprisemanagement.rb#11
class Monolith::Twirp::Proxima::Enterprisemanagement::Error < ::StandardError; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/version.rb#3
module MonolithTwirp; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/version.rb#4
module MonolithTwirp::Proxima; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#88
module MonolithTwirp::Proxima::EnterpriseManagement; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#89
module MonolithTwirp::Proxima::EnterpriseManagement::V1; end

class MonolithTwirp::Proxima::EnterpriseManagement::V1::CreateEnterpriseRequest
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

class MonolithTwirp::Proxima::EnterpriseManagement::V1::CreateEnterpriseResponse
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

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_twirp.rb#16
class MonolithTwirp::Proxima::EnterpriseManagement::V1::EnterpriseManagementAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def create_enterprise(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def validate_enterprise(input, req_opts = T.unsafe(nil)); end
end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_twirp.rb#9
class MonolithTwirp::Proxima::EnterpriseManagement::V1::EnterpriseManagementAPIService < ::Twirp::Service; end

module MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_EDUCATION = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_INVALID = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PLUS = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_PREMIER = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_UNIFIED_A = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_UNIFIED_P = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_PREMIER = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_UNIFIED_ADVANCED = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_PREMIUM_UNIFIED_PERFORMANCE = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#95
MonolithTwirp::Proxima::EnterpriseManagement::V1::SupportPlan::SUPPORT_PLAN_STANDARD = T.let(T.unsafe(nil), Integer)

module MonolithTwirp::Proxima::EnterpriseManagement::V1::TOSType
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#94
MonolithTwirp::Proxima::EnterpriseManagement::V1::TOSType::TOS_TYPE_CORPORATE = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#94
MonolithTwirp::Proxima::EnterpriseManagement::V1::TOSType::TOS_TYPE_CORPORATE_AND_EDUCATION = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#94
MonolithTwirp::Proxima::EnterpriseManagement::V1::TOSType::TOS_TYPE_CUSTOM = T.let(T.unsafe(nil), Integer)

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/v1/enterprise_management_api_pb.rb#94
MonolithTwirp::Proxima::EnterpriseManagement::V1::TOSType::TOS_TYPE_INVALID = T.let(T.unsafe(nil), Integer)

class MonolithTwirp::Proxima::EnterpriseManagement::V1::ValidateEnterpriseRequest
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

class MonolithTwirp::Proxima::EnterpriseManagement::V1::ValidateEnterpriseResponse
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

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/version.rb#5
module MonolithTwirp::Proxima::Enterprisemanagement; end

# source://monolith-twirp-proxima-enterprisemanagement//lib/monolith_twirp/proxima/enterprisemanagement/version.rb#6
MonolithTwirp::Proxima::Enterprisemanagement::VERSION = T.let(T.unsafe(nil), String)
