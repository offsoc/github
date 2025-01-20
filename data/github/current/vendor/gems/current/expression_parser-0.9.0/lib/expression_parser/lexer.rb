# Taken from http://lukaszwrobel.pl/blog/math-parser-part-3-implementation
module ExpressionParser

  class Lexer

    def initialize(input)
      @input = input
      @return_previous_token = false
    end

    def get_next_token
      if @return_previous_token
	@return_previous_token = false
	return @previous_token
      end

      token = Token.new

      @input.lstrip!

      case @input
      when /\A\+/ then
	token.kind = Token::Plus
      when /\A-/ then
	token.kind = Token::Minus
      when /\A\*/ then
	token.kind = Token::Multiply
      when /\Adiv/ then
	token.kind = Token::Divide
      when /\A\// then
	token.kind = Token::Divide
      when /\A\d+(\.\d+)?/
	token.kind = Token::Number
	token.value = $&.to_f
      when /\A\(/
	token.kind = Token::LParen
      when /\A\)/
	token.kind = Token::RParen
      when ''
	token.kind = Token::End
      when /\Ae/
	token.kind = Token::Number
	token.value = 2.718281828459
      when /\Api/
	token.kind = Token::Number
	token.value = 3.1415926535898
      when /\Amod/
	token.kind = Token::MOD
      when /\A!=/
	token.kind = Token::NotEqual
      when /\A<>/
	token.kind = Token::NotEqual
      when /\A>=/
	token.kind = Token::GThanE
      when /\A>/
	token.kind = Token::GThan
      when /\A<=/
	token.kind = Token::LThanE
      when /\A</
	token.kind = Token::LThan
      when /\A=/
	token.kind = Token::Equal
      end

      raise "Unknown token #{@input}" if token.unknown?
      @input = $'

      @previous_token = token
      token
    end

    def revert
      @return_previous_token = true
    end
  end

end
