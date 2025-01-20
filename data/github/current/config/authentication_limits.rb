# typed: true
# frozen_string_literal: true

# Configure authentication rate limits.
if GitHub.lockouts_enabled? && AuthenticationLimit.instances.empty?
  # A few people mistyping passwords from the same IP.
  AuthenticationLimit.new name: :short_ip,
                          max_tries: 10,
                          ttl: 5.minutes,
                          data_key: :ip

  # Probably a malicious IP trying to brute-force multiple accounts.
  AuthenticationLimit.new name: :long_ip,
                          max_tries: 200,
                          ttl: 12.hours,
                          ban_ttl: 1.week,
                          data_key: :ip

  if GitHub.web_ip_lockouts_enabled?
    # A few people mistyping passwords from the same IP (web only).
    AuthenticationLimit.new name: :short_web_ip,
                            max_tries: 10,
                            ttl: 5.minutes,
                            data_key: :web_ip,
                            whitelist_key: :ip

    # Probably a malicious IP trying to brute-force multiple accounts (web only).
    AuthenticationLimit.new name: :long_web_ip,
                            max_tries: 200,
                            ttl: 12.hours,
                            ban_ttl: 1.week,
                            data_key: :web_ip,
                            whitelist_key: :ip
  end

  # Password mistyped or misconfigured script.
  AuthenticationLimit.new name: :short_login,
                          max_tries: 5,
                          ttl: 5.minutes,
                          ban_ttl: 10.minutes,
                          data_key: :login

  # Probably brute force attack. Possibly misconfigured script.
  AuthenticationLimit.new name: :long_login,
                          max_tries: 100,
                          ttl: 12.hours,
                          ban_ttl: 1.week,
                          data_key: :login

  # Password reset by email
  AuthenticationLimit.new name: :short_password_reset_email,
                          max_tries: 4,
                          ttl: 30.minutes,
                          ban_ttl: 30.minutes,
                          data_key: :password_reset_login

  # Change password. Victim's github session is 'hijacked' or in a 'logged in' state for the attacker.
  AuthenticationLimit.new name: :short_change_password,
                          max_tries: 5,
                          ttl: 5.minutes,
                          ban_ttl: 10.minutes,
                          data_key: :change_password_login

  # Change password. Victim's github session is 'hijacked' or in a 'logged in' state for the attacker.
  AuthenticationLimit.new name: :long_change_password,
                          max_tries: 100,
                          ttl: 12.hours,
                          ban_ttl: 1.day,
                          data_key: :change_password_login

  # The user mistypes a few OTPs.
  AuthenticationLimit.new name: :short_2fa_login,
                          max_tries: 5,
                          ttl: 10.minutes,
                          data_key: :two_factor_login

  # Semi-permanent. The password has been compromised.
  AuthenticationLimit.new name: :long_2fa_login,
                          max_tries: 200,
                          ttl: 1.month,
                          ban_ttl: 12.months,
                          data_key: :two_factor_login

  # Email verification links and launch codes. Prevent brute force attack.
  AuthenticationLimit.new name: :short_email_verification_login,
                          max_tries: 50,
                          ttl: 60.minutes,
                          data_key: :email_verification_login

  AuthenticationLimit.new name: :long_email_verification_login,
                          max_tries: 500,
                          ttl: 1.day,
                          ban_ttl: 1.week,
                          data_key: :email_verification_login

  if GitHub.sign_in_analysis_enabled?
    AuthenticationLimit.new name: :short_verified_device_challenge,
                            max_tries: 5,
                            ttl: 10.minutes,
                            data_key: :verified_device_login

    AuthenticationLimit.new name: :long_verified_device_challenge,
                            max_tries: 200,
                            ttl: 1.month,
                            ban_ttl: 12.months,
                            data_key: :verified_device_login

    AuthenticationLimit.new name: :short_authenticated_device_creation,
                              max_tries: 10,
                              ttl: 60.minutes,
                              data_key: :device_creation_login

    AuthenticationLimit.new name: :long_authenticated_device_creation,
                              max_tries: 50,
                              ttl: 1.day,
                              ban_ttl: 1.week,
                              data_key: :device_creation_login

    AuthenticationLimit.new name: :short_known_device_use,
                              max_tries: 10,
                              ttl: 60.minutes,
                              data_key: :device_use_login

    AuthenticationLimit.new name: :long_known_device_use,
                              max_tries: 50,
                              ttl: 1.day,
                              ban_ttl: 1.week,
                              data_key: :device_use_login
  end

  # 5 2FA SMS setup attempts in 1 hour is just a little more than we think is reasonable
  # block them from the endpoint for 1 hour
  # this matches the rate_limit_requests (Redis rate limitter) config in two_factor_controller
  AuthenticationLimit.new name: :short_sms_2fa_setup_by_login,
                          max_tries: 6,
                          ttl: 1.hour,
                          ban_ttl: 1.hour,
                          data_key: :sms_2fa_setup_by_login

  # 100 2FA SMS setup attempts in 12 hours is almost definitely someone misusing the endpoint
  # block them from the endpoint for 1 day
  AuthenticationLimit.new name: :long_sms_2fa_setup_by_login,
                          max_tries: 101,
                          ttl: 12.hours,
                          ban_ttl: 1.day,
                          data_key: :sms_2fa_setup_by_login

  # 100 2FA SMS setup attempts from spammy users in the same IP in 1 hour
  # kick in the secondary limit based on login below (:sms_2fa_setup_spammy_ip_secondary_limit_by_login) for 1 hour
  # only users that are marked as spammy will potentially be limitted from the endpoint (based on :sms_2fa_setup_spammy_ip_secondary_limit_by_login)
  AuthenticationLimit.new name: :short_sms_2fa_setup_by_spammy_ip,
                          max_tries: 101,
                          ttl: 1.hour,
                          ban_ttl: 1.hour,
                          data_key: :sms_2fa_setup_by_spammy_ip

  # 1000 2FA SMS setup attempts from spammy users in the same IP in 12 hour
  # kick in the secondary limit based on login below (:sms_2fa_setup_spammy_ip_secondary_limit_by_login) for 1 week
  # only users that are marked as spammy will potentially be limitted from the endpoint (based on :sms_2fa_setup_spammy_ip_secondary_limit_by_login)
  AuthenticationLimit.new name: :long_sms_2fa_setup_by_spammy_ip,
                          max_tries: 1001,
                          ttl: 12.hours,
                          ban_ttl: 1.week,
                          data_key: :sms_2fa_setup_by_spammy_ip

  # This limitter only kicks in _after_ :sms_2fa_setup_by_spammy_ip is at the limit and the endpoint is being accessed via a spammy user
  # This second-tier limit is to prevent legitimate users (albeit marked as spammy) that share IPs (e.g. shared workspace or VPN) from being
  # blocked from the endpoint the first time they call it if :sms_2fa_setup_by_spammy_ip is at it's limit (from other spammy users using the same IP)
  # 2 SMS messages in 1 hour will ban them for 1 hour
  AuthenticationLimit.new name: :short_sms_2fa_setup_spammy_ip_secondary_limit_by_login,
                          max_tries: 3,
                          ttl: 1.hour,
                          ban_ttl: 1.hour,
                          data_key: :sms_2fa_setup_spammy_ip_secondary_limit_by_login

  # This limitter only kicks in _after_ :sms_2fa_setup_by_spammy_ip is at the limit and the endpoint is being accessed via a spammy user
  # This second-tier limit is to prevent legitimate users (albeit marked as spammy) that share IPs (e.g. shared workspace or VPN) from being
  # blocked from the endpoint the first time they call it if :sms_2fa_setup_by_spammy_ip is already it's limit (from other spammy users using the same IP)
  # 10 SMS messages in 12 hour will ban them for 1 week
  AuthenticationLimit.new name: :long_sms_2fa_setup_spammy_ip_secondary_limit_by_login,
                          max_tries: 11,
                          ttl: 12.hours,
                          ban_ttl: 1.week,
                          data_key: :sms_2fa_setup_spammy_ip_secondary_limit_by_login
end
