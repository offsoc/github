# typed: true
# frozen_string_literal: true

require "primer/view_components/linters"
# force classes validation so `SystemArgumentInsteadOfClass` works as expected
Primer::Classify::Utilities.validate_class_names = true
