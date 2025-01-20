require File.join(File.dirname(__FILE__),'lib/expression_parser')
include ExpressionParser

describe Parser do
  before(:each) do
    @parser = Parser.new
  end

  it 'should compute 5 when given 2 + 3' do
    @parser.parse('2 + 3').should == 5
  end

  it 'should compute 6 when given 2 * 3' do
    @parser.parse('2 * 3').should == 6
  end

  it 'should compute 89 when given 89' do
    @parser.parse('89').should == 89
  end

  it 'should raise an error when input is empty' do
    lambda {@parser.parse('')}.should raise_error()
  end

  it 'should omit white spaces' do
    @parser.parse('   12        -  8   ').should == 4
    @parser.parse('142        -9   ').should == 133
    @parser.parse('72+  15').should == 87
    @parser.parse(' 12*  4').should == 48
    @parser.parse(' 50/10').should == 5
  end

  it 'should treat dot separated floating point numbers as a valid input' do
    @parser.parse('2.5').should == 2.5
    @parser.parse('4*2.5 + 8.5+1.5 / 3.0').should == 19
    @parser.parse('5.0005 + 0.0095').should be_close(5.01, 0.01)
  end

  it 'should handle tight expressions' do
    @parser.parse('67+2').should == 69
    @parser.parse(' 2-7').should == -5
    @parser.parse('5*7 ').should == 35
    @parser.parse('8/4').should == 2
  end

  it 'should calculate long additive expressions from left to right' do
    @parser.parse('2 -4 +6 -1 -1- 0 +8').should == 10
    @parser.parse('1 -1   + 2   - 2   +  4 - 4 +    6').should == 6
  end

  it 'should calculate long multiplicative expressions from left to right' do
    @parser.parse('2 -4 +6 -1 -1- 0 +8').should == 10
    @parser.parse('1 -1   + 2   - 2   +  4 - 4 +    6').should == 6
  end

  it 'should calculate long, mixed additive and multiplicative expressions from left to right' do
    @parser.parse(' 2*3 - 4*5 + 6/3 ').should == -12
    @parser.parse('2*3*4/8 -   5/2*4 +  6 + 0/3   ').should == -1
  end

  it 'should return float pointing numbers when division result is not an integer' do
    @parser.parse('10/4').should == 2.5
    @parser.parse('5/3').should be_close(1.66, 0.01)
    @parser.parse('3 + 8/5 -1 -2*5').should be_close(-6.4, 0.01)
  end

  it 'should raise an error on wrong token' do
    lambda {@parser.parse('  6 + c')}.should raise_error()
    lambda {@parser.parse('  7 &amp; 2')}.should raise_error()
    lambda {@parser.parse('  %')}.should raise_error()
  end

  it 'should raise an error on syntax error' do
    lambda {@parser.parse(' 5 + + 6')}.should raise_error()
    lambda {@parser.parse(' -5 + 2')}.should raise_error()
  end

  it 'should return Infinity when attempt to divide by zero occurs' do
    @parser.parse('5/0').should be_infinite
    @parser.parse(' 2 - 1 + 14/0 + 7').should be_infinite
  end

  it 'should compute 2 when given (2)' do
    @parser.parse('(2)').should == 2
  end

  it 'should compute complex expressions enclosed in parenthesis' do
    @parser.parse('(5 + 2*3 - 1 + 7 * 8)').should == 66
    @parser.parse('(67 + 2 * 3 - 67 + 2/1 - 7)').should == 1
  end

  it 'should compute expressions with many subexpressions enclosed in parenthesis' do
    @parser.parse('(2) + (17*2-30) * (5)+2 - (8/2)*4').should == 8
    @parser.parse('(5*7/5) + (23) - 5 * (98-4)/(6*7-42)').should be_infinite
  end

  it 'should handle nested parenthesis' do
    @parser.parse('(((((5)))))').should == 5
    @parser.parse('(( ((2)) + 4))*((5))').should == 30
  end

  it 'should raise an error on unbalanced parenthesis' do
    lambda {@parser.parse('2 + (5 * 2')}.should raise_error()
    lambda {@parser.parse('(((((4))))')}.should raise_error()
    lambda {@parser.parse('((2)) * ((3')}.should raise_error()
    lambda {@parser.parse('((9)) * ((1)')}.should raise_error()
  end
end

