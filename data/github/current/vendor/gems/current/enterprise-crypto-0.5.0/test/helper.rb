require 'test/unit'
require 'spec/mini'
require 'tempfile'

begin
  require 'redgreen'
  require 'leftright'
rescue LoadError
end

if defined? Debugger
  require 'ruby-debug'
  Debugger.start
end

$:.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))
$:.unshift(File.dirname(__FILE__), '..')

require 'enterprise/crypto'

require './test/vault'

include Enterprise::Crypto

def with_corrupt_md5
  corrupt_md5

  yield if block_given?
ensure
  uncorrupt_md5
end

def corrupt_md5
  Digest::MD5.class_eval do
      alias_method :_hexdigest, :hexdigest

      def hexdigest(*)
        'a' * 32
      end
  end
end

def uncorrupt_md5
  Digest::MD5.class_eval do
      alias_method :hexdigest, :_hexdigest
  end
end

def assert_valid_license(license, info)
  assert_equal info[:name],  license.customer.name
  assert_equal info[:email], license.customer.email
  assert_equal info[:seats], license.seats
  assert_equal info[:now], license.expire_at.to_s
end

Enterprise::Crypto.key_size = 1024

KEY_DIR = File.join(File.dirname(__FILE__), 'files')
