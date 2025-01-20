require 'rubygems'
require 'minitest/autorun'
require 'mocha/api'

$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))
$LOAD_PATH.unshift(File.dirname(__FILE__))
require 'bertrpc'

module BERTRPC
  class Spec < Minitest::Spec
    class << self
      alias :context :describe
      alias :setup :before
      alias :should :it
    end
    include Mocha::API

    def setup
      mocha_setup
      super
    end

    def teardown
      super
      mocha_verify
      mocha_teardown
    end
  end
end

class Enc
  include BERTRPC::Encodes
end
