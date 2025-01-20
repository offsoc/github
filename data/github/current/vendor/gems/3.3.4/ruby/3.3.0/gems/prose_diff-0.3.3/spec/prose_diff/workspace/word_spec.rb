require 'spec_helper'

describe "word changes" do

  it 'should know that two words correspond' do
    h1, h2 = %Q{<p>Greeetings</p>}, %Q{<p>Greetings</p>}
    n1, n2 = parse(h1), parse(h2)
    w1, w2 = n1.children.first, n2.children.first
    expect( w1.kind_of?(Nokogiri::XML::Text) ).to be_truthy
    expect( ProseDiff::Node.appear_to_correspond?(w1, w2) ).to be_truthy
  end

end