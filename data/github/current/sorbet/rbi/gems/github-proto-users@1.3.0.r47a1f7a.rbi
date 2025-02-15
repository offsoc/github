# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `github-proto-users` gem.
# Please instead update this file by running `bin/tapioca gem github-proto-users`.

# source://github-proto-users//lib/github/proto/users/version.rb#3
module GitHub
  extend ::GitHub::Config::FirstPartyApps
  extend ::GitHub::Config::Metadata
  extend ::GitHub::Config::Datacenter
  extend ::GitHub::Config::ProximaSyncedThirdPartyApps
  extend ::GitHub::Config::Fastly
  extend ::GitHub::Config::Importers
  extend ::GitHub::Config::Kredz
  extend ::GitHub::Config::Varz
  extend ::GitHub::Config::Launch
  extend ::GitHub::Config::LegacyTextileFormatting
  extend ::GitHub::Config::Dreamlifter
  extend ::GitHub::Config::Migration
  extend ::GitHub::Config::Render
  extend ::GitHub::Config::Smtp
  extend ::GitHub::Config::Spokes
  extend ::GitHub::Config::Spokesd
  extend ::GitHub::Config::SupportLink
  extend ::GitHub::Config::Pages
  extend ::GitHub::Config::RequestLimits
  extend ::GitHub::Config::RateLimits
  extend ::GitHub::Config::OpenTelemetry
  extend ::GitHub::Config::HydroConfig
  extend ::GitHub::Config::Redis
  extend ::GitHub::Config::GroupSyncer
  extend ::GitHub::Config::Dependabot
  extend ::GitHub::Config::Twirp
  extend ::GitHub::Config::DriftwoodConfig
  extend ::GitHub::Config::PullRequests
  extend ::GitHub::Config::Repositories
  extend ::GitHub::Config::S3
  extend ::GitHub::Config::Registry
  extend ::GitHub::Config::SystemRoles
  extend ::GitHub::Config::Elasticsearch
  extend ::GitHub::Config::OpenApi
  extend ::GitHub::Config::AuditLogCuratorConfig
  extend ::GitHub::Config::AuditLog
  extend ::GitHub::Config::Billing
  extend ::GitHub::Config::AfterResponse
  extend ::GitHub::Config::Features
  extend ::GitHub::Config::ApiVersioning
  extend ::GitHub::Config::InsightsConfig
  extend ::GitHub::Config::HttpFluentbitConfig
  extend ::GitHub::Config::CodeScanning
  extend ::GitHub::Config::CodeQLVariantAnalysis
  extend ::GitHub::Config::OctoshiftStorage
  extend ::GitHub::Config::OIDCProviders
  extend ::GitHub::Config::BingIndexnow
  extend ::GitHub::Config::Chatops
  extend ::GitHub::Config::IssuesGraphApiConfig
  extend ::GitHub::Config::TimelineApiConfig
  extend ::GitHub::Config::Memex
  extend ::GitHub::Config::MergeQueue
  extend ::GitHub::Config::Codespaces
  extend ::GitHub::Config::Copilot
  extend ::GitHub::Config::Azure
  extend ::GitHub::Config::MultiTenantEnterprise
  extend ::GitHub::Config::NotebooksConfig
  extend ::GitHub::Config::ViewscreenConfig
  extend ::GitHub::Config::Freno
  extend ::GitHub::Config::ActionsResults
  extend ::GitHub::Config::Conduit
  extend ::GitHub::Config::ActionsBroker
  extend ::GitHub::Config::ActionsBrokerWorker
  extend ::GitHub::Config::ActionsRunnerAdmin
  extend ::GitHub::Config::ActionsRunService
  extend ::GitHub::Config::ActionsScaleUnitDomains
  extend ::GitHub::Config::Proxima
  extend ::GitHub::Config::ProximaLoginExperience
  extend ::GitHub::Config::GitSrcMigrator
  extend ::GitHub::Config::Projects
  extend ::GitHub::Config::EnterpriseAccounts
  extend ::GitHub::Config::Orca
  extend ::GitHub::Config::Orcid
  extend ::GitHub::Config::Context
  extend ::GitHub::Config
  extend ::GitHub::Version
  extend ::GitHub::Config::Stats

  class << self
    def after_response_middleware_enabled; end
    def after_response_middleware_enabled=(_arg0); end
    def after_response_middleware_enabled?; end
    def after_response_raise_on_exception; end
    def after_response_raise_on_exception=(_arg0); end
    def after_response_raise_on_exception?; end
    def robot?(useragent); end
  end
end

module GitHub::AppPartitioning; end
module GitHub::CSP; end
module GitHub::DataStructures; end

# source://github-proto-users//lib/github/proto/users/version.rb#4
module GitHub::Proto; end

# source://github-proto-users//lib/github/proto/users/version.rb#5
module GitHub::Proto::Users; end

# source://github-proto-users//lib/github-proto-users.rb#12
class GitHub::Proto::Users::Error < ::StandardError; end

# source://github-proto-users//lib/github/proto/users/v1/enterprise_installations_list_item_pb.rb#23
module GitHub::Proto::Users::V1; end

class GitHub::Proto::Users::V1::AreEmailVerifiedUsersRequest
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

class GitHub::Proto::Users::V1::AreEmailVerifiedUsersResponse
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

class GitHub::Proto::Users::V1::BusinessListItem
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

# source://github-proto-users//lib/github/proto/users/v1/businesses_api_twirp.rb#15
class GitHub::Proto::Users::V1::BusinessesAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_businesses(input, req_opts = T.unsafe(nil)); end
end

# source://github-proto-users//lib/github/proto/users/v1/businesses_api_twirp.rb#9
class GitHub::Proto::Users::V1::BusinessesAPIService < ::Twirp::Service; end

module GitHub::Proto::Users::V1::EmailVisibility
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://github-proto-users//lib/github/proto/users/v1/email_visibility_pb.rb#20
GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_INVALID = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/email_visibility_pb.rb#20
GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_PRIVATE = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/email_visibility_pb.rb#20
GitHub::Proto::Users::V1::EmailVisibility::EMAIL_VISIBILITY_PUBLIC = T.let(T.unsafe(nil), Integer)

class GitHub::Proto::Users::V1::EnterpriseInstallationsListItem
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

class GitHub::Proto::Users::V1::EnterpriseServerLicensesListItem
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

class GitHub::Proto::Users::V1::FetchSessionTokenRequest
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

class GitHub::Proto::Users::V1::FetchSessionTokenResponse
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

class GitHub::Proto::Users::V1::FindUsersRequest
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

class GitHub::Proto::Users::V1::FindUsersResponse
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

# source://github-proto-users//lib/github/proto/users/v1/following_api_twirp.rb#17
class GitHub::Proto::Users::V1::FollowingAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_following_users(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def is_following(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def select_mutual_followers(input, req_opts = T.unsafe(nil)); end
end

# source://github-proto-users//lib/github/proto/users/v1/following_api_twirp.rb#9
class GitHub::Proto::Users::V1::FollowingAPIService < ::Twirp::Service; end

class GitHub::Proto::Users::V1::GetBlockingUsersRequest
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

class GitHub::Proto::Users::V1::GetBlockingUsersResponse
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

class GitHub::Proto::Users::V1::GetBusinessesRequest
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

class GitHub::Proto::Users::V1::GetBusinessesResponse
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

class GitHub::Proto::Users::V1::GetFollowingUsersRequest
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

class GitHub::Proto::Users::V1::GetFollowingUsersResponse
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

class GitHub::Proto::Users::V1::GetVisibleUsersRequest
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

class GitHub::Proto::Users::V1::GetVisibleUsersResponse
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

class GitHub::Proto::Users::V1::IdentifyTokenUserRequest
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

class GitHub::Proto::Users::V1::IdentifyTokenUserResponse
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

class GitHub::Proto::Users::V1::IsEmailVerifiedUserRequest
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

class GitHub::Proto::Users::V1::IsEmailVerifiedUserResponse
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

class GitHub::Proto::Users::V1::IsFollowingRequest
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

class GitHub::Proto::Users::V1::IsFollowingResponse
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

class GitHub::Proto::Users::V1::IsVisibleUserRequest
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

class GitHub::Proto::Users::V1::IsVisibleUserResponse
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

module GitHub::Proto::Users::V1::Reason
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://github-proto-users//lib/github/proto/users/v1/reason_pb.rb#21
GitHub::Proto::Users::V1::Reason::REASON_BLOCKED = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/reason_pb.rb#21
GitHub::Proto::Users::V1::Reason::REASON_INVALID = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/reason_pb.rb#21
GitHub::Proto::Users::V1::Reason::REASON_SPAMMY = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/reason_pb.rb#21
GitHub::Proto::Users::V1::Reason::REASON_SUSPENDED = T.let(T.unsafe(nil), Integer)

class GitHub::Proto::Users::V1::SearchUsersRequest
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

class GitHub::Proto::Users::V1::SearchUsersResponse
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

class GitHub::Proto::Users::V1::SelectMutualFollowersRequest
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

class GitHub::Proto::Users::V1::SelectMutualFollowersResponse
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

class GitHub::Proto::Users::V1::TokenUserIdentity
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

# source://github-proto-users//lib/github/proto/users/v1/tokens_api_twirp.rb#16
class GitHub::Proto::Users::V1::TokensAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def fetch_session_token(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def identify_token_user(input, req_opts = T.unsafe(nil)); end
end

# source://github-proto-users//lib/github/proto/users/v1/tokens_api_twirp.rb#9
class GitHub::Proto::Users::V1::TokensAPIService < ::Twirp::Service; end

class GitHub::Proto::Users::V1::UserBlockingResultItem
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

class GitHub::Proto::Users::V1::UserEmailVerificationResultItem
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

class GitHub::Proto::Users::V1::UserListItem
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

module GitHub::Proto::Users::V1::UserType
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://github-proto-users//lib/github/proto/users/v1/user_type_pb.rb#22
GitHub::Proto::Users::V1::UserType::USER_TYPE_BOT = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/user_type_pb.rb#22
GitHub::Proto::Users::V1::UserType::USER_TYPE_INVALID = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/user_type_pb.rb#22
GitHub::Proto::Users::V1::UserType::USER_TYPE_MANNEQUIN = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/user_type_pb.rb#22
GitHub::Proto::Users::V1::UserType::USER_TYPE_ORGANIZATION = T.let(T.unsafe(nil), Integer)

# source://github-proto-users//lib/github/proto/users/v1/user_type_pb.rb#22
GitHub::Proto::Users::V1::UserType::USER_TYPE_USER = T.let(T.unsafe(nil), Integer)

class GitHub::Proto::Users::V1::UserVerifiedEmailsResultItem
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

class GitHub::Proto::Users::V1::UserVisibilityResultItem
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

# source://github-proto-users//lib/github/proto/users/v1/users_api_twirp.rb#21
class GitHub::Proto::Users::V1::UsersAPIClient < ::Twirp::Client
  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def are_email_verified_users(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def find_users(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_blocking_users(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def get_visible_users(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def is_email_verified_user(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def is_visible_user(input, req_opts = T.unsafe(nil)); end

  # source://twirp/1.10.0/lib/twirp/client.rb#42
  def search_users(input, req_opts = T.unsafe(nil)); end
end

# source://github-proto-users//lib/github/proto/users/v1/users_api_twirp.rb#9
class GitHub::Proto::Users::V1::UsersAPIService < ::Twirp::Service; end

# source://github-proto-users//lib/github/proto/users/version.rb#6
GitHub::Proto::Users::VERSION = T.let(T.unsafe(nil), String)

module GitHub::SCIM; end
module Google::Protobuf::MessageExts::ClassMethods; end
