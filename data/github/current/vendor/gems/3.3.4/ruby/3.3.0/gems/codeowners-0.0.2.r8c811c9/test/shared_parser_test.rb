# frozen_string_literal: true

module SharedParserTest

  def assert_email_with_quote(parser)
    @parser = parser
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      /docs     o'reilly@example.com
      /app      John.O'Citizen@example.com
    CODEOWNERS

    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count

    assert rule = rules.shift
    assert_equal 2, rule.line
    assert_equal "/app", rule.pattern.to_s
    assert_equal ["John.O'Citizen@example.com"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 1, rule.line
    assert_equal "/docs", rule.pattern.to_s
    assert_equal ["o'reilly@example.com"], rule.owners.map(&:identifier)
  end
end