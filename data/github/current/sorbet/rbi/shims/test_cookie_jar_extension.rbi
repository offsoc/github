# frozen_string_literal: true
# typed: true

module CookieJarExtension
  extend T::Sig

  sig { params(raw_cookies: String, uri: T.nilable(String)).void }
  def merge(raw_cookies, uri = nil); end
end
