# Taken from http://lukaszwrobel.pl/blog/math-parser-part-3-implementation
module ExpressionParser

  class Token
    Plus     = 0
    Minus    = 1
    Multiply = 2
    Divide   = 3

    Number   = 4

    LParen   = 5
    RParen   = 6

    MOD      = 7
    GThan    = 8
    LThan    = 9
    Equal    = 10
    NotEqual = 11
    GThanE   = 12
    LThanE   = 13

    End      = 14

    attr_accessor :kind
    attr_accessor :value

    def initialize
      @kind = nil
      @value = nil
    end

    def unknown?
      @kind.nil?
    end
  end

end
