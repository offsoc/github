# frozen_string_literal: true

require 'scout/heuristics'
require 'scout/strategy/extension'
require 'scout/strategy/filename'

class << Scout
  def detect(blob, allow_empty: false)
    return nil if blob.likely_binary? || blob.binary? || (!allow_empty && blob.empty?)

    Scout.instrument("scout.detection", :blob => blob) do
      stack = []
      returning_strategy = nil
      STRATEGIES.each do |strategy|
        returning_strategy = strategy
        candidates = Scout.instrument("scout.strategy", :blob => blob, :strategy => strategy, :candidates => stack) do
          strategy.call(blob, stack)
        end

        stack = candidates
      end

      Scout.instrument("scout.detected", :blob => blob, :strategy => returning_strategy, :stack => stack)
      stack
    end
  end

  STRATEGIES = [
    Scout::Strategy::Filename,
    Scout::Strategy::Extension,
    Scout::Heuristics
  ]

  attr_accessor :instrumenter

  def instrument(*args, &bk)
    if instrumenter
      instrumenter.instrument(*args, &bk)
    elsif block_given?
      yield
    end
  end

end
