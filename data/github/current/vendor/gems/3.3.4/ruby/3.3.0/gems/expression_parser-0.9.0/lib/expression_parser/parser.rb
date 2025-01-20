# Taken from http://lukaszwrobel.pl/blog/math-parser-part-3-implementation
module ExpressionParser

  class Parser
    def parse(input)
      @lexer = Lexer.new(input)

      expression_value = expression
      token = @lexer.get_next_token
      if token.kind == Token::End
	expression_value
      else
	case token.kind
        when Token::GThan
	  expression_value > expression ? 1 : 0
	when Token::LThan
	  expression_value < expression ? 1 : 0
	when Token::Equal
	  expression_value == expression ? 1 : 0
	when Token::NotEqual
	  expression_value != expression ? 1 : 0
	when Token::GThanE
	  expression_value >= expression ? 1 : 0
	when Token::LThanE
	  expression_value <= expression ? 1 : 0
	else
	  raise 'End expected'
	end
      end
    end

    protected
    def expression
      component1 = factor

      additive_operators = [Token::Plus, Token::Minus]

      token = @lexer.get_next_token
      while additive_operators.include?(token.kind)
	component2 = factor

	if token.kind == Token::Plus
	  component1 += component2
	else
	  component1 -= component2
	end

	token = @lexer.get_next_token
      end
      @lexer.revert

      component1
    end

    def factor
      factor1 = number

      multiplicative_operators = [Token::Multiply, Token::Divide, Token::MOD]

      token = @lexer.get_next_token
      while multiplicative_operators.include?(token.kind)
	factor2 = number

	if token.kind == Token::Multiply
	  factor1 *= factor2
	elsif token.kind == Token::MOD
	  factor1 %= factor2
	else
	  factor1 /= factor2
	end

	token = @lexer.get_next_token
      end
      @lexer.revert

      factor1
    end

    def number
      token = @lexer.get_next_token

      if token.kind == Token::LParen
	value = expression

	expected_rparen = @lexer.get_next_token
	raise 'Unbalanced parenthesis' unless expected_rparen.kind == Token::RParen
      elsif token.kind == Token::Number
	value = token.value
      else
	raise 'Not a number'
      end

      value
    end
  end

end
