require 'spec_helper'

describe ProseDiff::Node::Proxy::Span do

  it 'unsplit' do
    a, b = ProseDiff::Node.HTML('<p>Git</p>').first.children.first, ProseDiff::Node.HTML('<p>Hub</p>').first.children.first
    c = Nokogiri::XML::NodeSet.new(b.document, [b])
    d = ProseDiff::Node.unsplit_all(a, c)
    e = ProseDiff::Node.unsplit(a, b)
    expect( d.to_html).to eq( e.to_html )
  end

  it 'should unsplit with another empty span' do
    a, b = ProseDiff::Node.HTML('<p><span>Got</span></p>').first.children.first, ProseDiff::Node.HTML('<p><span>Milk</span></p>').first.children.first
    c = ProseDiff::Node.unsplit(a, b)
    expect( c.to_html ).to eq('<span>GotMilk</span>')
  end

  it 'should unsplit with some text if it\'s unadorned' do
    a, b = ProseDiff::Node.HTML('<p><span>Gouda</span></p>').first.children.first, ProseDiff::Node.HTML('<p>Munster</p>').first.children.first
    c = ProseDiff::Node.unsplit(a, b)
    expect( c.to_html ).to eq('<span>GoudaMunster</span>')
  end

end
