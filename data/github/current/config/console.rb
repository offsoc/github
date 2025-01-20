# typed: ignore
# frozen_string_literal: true

require "socket"

$stderr.puts "Loading config/console.rb"
$console = true # so we know we're in a console (for guards)

GitHub.component = :console
# Load license so it won't be lazy loaded later and cause issues
GitHub::Enterprise.license if GitHub.enterprise? && !Rails.env.development?

def enable_query_logging
  ActiveRecord::Base.logger = Logger.new(STDOUT)
end

# Bump timeout up from 20 second default.
GitRPC.timeout = 30.minutes.to_i

# shortcut to Repository.nwo.
def with_name_with_owner(name_with_owner)
  GitHub::Resources.with_name_with_owner(name_with_owner)
end

alias :nwo :with_name_with_owner

# user  = the 'defunkt'
# user  = the 'chris@github.com'
# team  = the 'github/brunch'
# team  = the '@github/brunch'
# repo  = the 'defunkt/dotjs'
# pr    = the 'github/gist/pull/123'
# issue = the 'github/gist/issues/123'
# issue = the 'github/gist#123'
# disc  = the 'github/gist#345'
# entry = the 'github/github/blob/master/Blakefile'
def find_by_uri(str)  # rubocop:disable GitHub/FindByDef
  GitHub::Resources.find_by_uri(str)
end

def debug_emu(str)
  user = User.find_by_login(str)

  if !user&.is_enterprise_managed?
    puts "Quitting because user is not externally managed."
    return
  end

  puts ".........User.data........."
  p "user.id", user.id, "user.login", user.login, "user.created_at", user.created_at, "user.updated_at", user.updated_at, "user.disabled", user.disabled
  p user.emails.pluck(:email, :primary)

  p "......Business.User.Accounts....."
  if user.business_user_accounts.count > 1
    p "!!! Alert: user has more than 1 business user account !!!"
  end
  p user.business_user_accounts.pluck(:user_id, :business_id, :created_at)

  puts ".........External.Identities......."
  if user.external_identities.count > 1
    p "!!! Alert: user has more than 1 external identity."
  end
  p user.external_identities.pluck(:user_id, :guid, :provider_type, :provider_id, :external_id_attr, :external_id, :disabled_at, :deleted_at)

  p "......Group memberships.of.each.external.identity...."
  user.external_identities.each do |eid|
    p eid.external_identity_group_memberships.pluck(:external_group_id, :external_identity_id, :created_at, :updated_at)
  end
end

alias :find_by_url :find_by_uri
alias :the  :find_by_uri
alias :that :find_by_uri
alias :yon  :find_by_uri
alias :such :find_by_uri
alias :dat  :find_by_uri
alias :emu  :debug_emu

def set_tenant(slug)
  business = Business.find_by(slug: slug.to_param)
  if business
    GitHub::CurrentTenant.set business
    puts "set current tenant to #{business.name}"
  else
    puts "could not find tenant #{slug}"
  end
  business
end

def reset_tenant
  GitHub::CurrentTenant.remove
  puts "cleared the current tenant"
end

# Allows you to look up and fetch an object based on its global relay id.
# Default user is Hubot.
def find_by_global_relay_id(id, user = User.find_by_login("hubot"))  # rubocop:disable GitHub/FindByDef
  Platform::Security::RepositoryAccess.with_viewer(user) do
    permission = Platform::Authorization::Permission.new(viewer: user, origin: Platform::ORIGIN_MANUAL_EXECUTION)

    Platform::Helpers::NodeIdentification.untyped_object_from_id(id, permission: permission).sync #rubocop: disable GitHub/UntypedObjectId
  end
rescue Platform::Errors
  puts "Something went wrong. Sorry!"
end

def browse(model)
  GitHub::Resources.url_for_model(model).tap do |url|
    Progeny::Command.new("open", url) if Rails.env.development?
  end
end

# >> time { some_slow_method }
#     user     system      total        real
# 0.960000   0.020000   0.980000 (  0.990485)
def time(times = 1)
  require "benchmark"
  ret = nil
  Benchmark.bm { |x| x.report { times.times { ret = yield } } }
  ret
end

# Is this username or IP blacklisted as spam?
def spam?(v)
  GitHub.kv.get("spam.denylisted_ip.#{v}").value! || GitHub.cache.get("blacklisted_login:#{v.downcase}", true)
end

# Un-spam-flag someone
def despam(v)
  GitHub.kv.del("spam.blacklisted_ip.#{v}")
  GitHub.cache.delete("blacklisted_login:#{v.downcase}")
end

# Removes fraud accounts based on an IP.  Creates a gist full of external
# transaction IDs that need to be refunded
def purge_fraud(ip)
  us = User.where last_ip: ip
  us.each do |u|
    u.billing_transactions.sales.select(&:refundable?).map do |t|
      GitHub::Billing.refund_transaction t.transaction_id
    end
    u.plan = "free"
    u.save
    u.suspend("Fraudster")
  end
  "Suspended #{us.size} accounts"
end

def generate_prepaid_codes(plan, num)
  codes = []

  num.times do
    c = Coupon.new
    c.plan = plan
    c.discount = 1
    c.duration = 6 * 30 # 6 months
    c.group = "prepaid"
    c.note = "Prepaid plan"
    c.save!

    codes << c.code
  end

  puts codes.join(" ")
end

def verbose_log!
  Object.const_set(:RAILS_DEFAULT_LOGGER, Logger.new($stdout))
  ActiveRecord::Base.logger = RAILS_DEFAULT_LOGGER
end

# Be extremely verbose when running callbacks. Every callback ever run will be
# printed to $stderr.
def verbose_callbacks!
  ActiveSupport::Callbacks::CallbackChain.class_eval do
    def run(object, options = {}, &terminator)
      enumerator = options[:enumerator] || :each

      if block_given?
        send(enumerator) do |callback|
          puts callback.method.to_s
          result = callback.call(object)
          break result if terminator.call(result, object)
        end
      else
        send(enumerator) do |callback|
          $stderr.puts callback.method.to_s
          callback.call(object)
        end
      end
    end
  end
end

# Find the poorly cased OauthAccess by token
def token(toke)
  return if !toke.is_a?(String) || toke.blank?
  OauthAccess.find_by_hashed_token(OauthAccess.hash_token(toke))
end

# bump an OauthApplication's rate_limit
def bump_rate(key, limit = 12500, temporary = false)
  if oauth = OauthApplication.find_by_key(key)
    if temporary
      oauth.set_temporary_rate_limit(limit)
    else
      oauth.rate_limit = limit
    end
    oauth.save
  end
end

# Shortcut to run queries and blocks of code against the readonly database.
def rodb(&block)
  ActiveRecord::Base.connected_to(role: :reading) { yield }
end

# Formerly, this was a shortcut to use the throttler.  Now it's a
# reminder of the correct way to throttle (introduced in
# https://github.com/github/github/pull/113502)
def throttle(&block)
  fail "Please use model-specific throttles, i.e. `User.throttle { users.update_all(...) }`"
end

# custom query log config for the console
# see config/initializers/query_log_tags

ActiveRecord::QueryLogs.taggings = ActiveRecord::QueryLogs.taggings.merge(
  category: -> { "console" }
)

def trace_chargeback(txn_id)
  if (txn = Billing::BillingTransaction.find_by_transaction_id txn_id)
    puts txn[:user_login]

    if (user = User.find txn[:user_id])
      puts "User disabled: #{user.disabled?}"
    else
      puts "User no longer exists"
    end
  else
    puts "No transaction found"
  end
end

# Set the current GitHub context actor as the currently logged-in user. This
# works with gh-console, which uses sudo from a personal account.
if File.exist?("/etc/github_users") # we're running in production!
  github_users = Hash[File.readlines("/etc/github_users").map { |u| u.strip.split(":") }]
  login = ENV["SUDO_USER"]

  if login && (actor = the(github_users[login]))
    GitHub.context.push actor: actor
    Audit.context.push actor: actor
  else
    warn "could not determine current user for audit logging!"
  end
end

# And if we're in a console, let's say so and also say where from:
GitHub.context.push console_host: Socket.gethostname
Audit.context.push console_host: Socket.gethostname
