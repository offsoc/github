class Test::Fast::TestCase < ActiveSupport::TestCase
  include LintingHelpers
end

class Test::GitHub
end

class DSTS::DSTSTestCase < Test::Fast::TestCase
end
