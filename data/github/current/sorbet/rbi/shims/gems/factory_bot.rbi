 # typed: true
# frozen_string_literal: true

module FactoryBot::Syntax::Default
  sig { params(block: T.proc.bind(FactoryBot::Syntax::Default::DSL).void).void }
  def define(&block); end
end
