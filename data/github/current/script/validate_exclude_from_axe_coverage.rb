# typed: strict
# frozen_string_literal: true

require "json"

exclude_from_axe_coverage = JSON.parse(File.read("script/accessibility/exclude_from_axe_coverage.json"))
valid_reasons = JSON.parse(File.read("script/accessibility/exclude_valid_reasons.json"))

exclude_from_axe_coverage.each do |route|
  if !route.keys.include?("reason") || route["reason"].empty? || !valid_reasons.include?(route["reason"])
    raise "Please set a valid `reason:` for excluding the route from e2e axe coverage. Valid reasons can be found in https://github.com/github/github/blob/master/script/accessibility/exclude_valid_reasons.json"
  end
end
