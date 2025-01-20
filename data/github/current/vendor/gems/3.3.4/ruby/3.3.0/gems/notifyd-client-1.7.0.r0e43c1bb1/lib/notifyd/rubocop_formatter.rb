# typed: ignore
# frozen_string_literal: true

# RubocopFormatter is a custom formatter that wraps the default actions
# formatter from rubocop. We use this because the output it gives doesn't refer
# to the root of our project, intead it refers to the root of the ruby
# codebase, which makes that errors are not properly reported.
#
# In case that this stops working don't hesitate to remove it. It is not
# important and shouldn't make you spend more than 15minutes trying to fix it.
class RubocopFormatter < RuboCop::Formatter::GitHubActionsFormatter
  private

  def report_offense(file, offense)
    output.printf(
      "\n::%<severity>s file=%<file>s,line=%<line>d,col=%<column>d::%<message>s",
      severity: github_severity(offense),
      file: "ruby/#{RuboCop::PathUtil.smart_path(file)}",
      line: offense.line,
      column: offense.real_column,
      message: github_escape(offense.message)
    )
  end
end
