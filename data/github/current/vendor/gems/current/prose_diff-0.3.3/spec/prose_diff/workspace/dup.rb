require './lib/prose_diff/node/node'

describe ProseDiff::Node do
  
  it 'should duplicate text' do
    t = ProseDiff::Node.HTML('<p>hello</p>').first.children.first
    expect( t ).to be_a_kind_of(ProseDiff::Node::Text)
    tt = t.dup
    expect( tt ).to be_a_kind_of(ProseDiff::Node::Text)
  end
  
  it 'should duplicate a paragraph of text' do
    p = ProseDiff::Node.HTML('<p>hello</p>').first
    expect( p ).to be_a_kind_of(ProseDiff::Node::Proxy::Base)
    pp = p.dup
    expect( pp ).to be_a_kind_of(ProseDiff::Node::Proxy::Base)
  end
  
  it 'should duplicate a span of text' do
    span = ProseDiff::Node.HTML('<p><span>hello</span></p>').xpath('//span').first
    expect( span.name ).to eq('span')
    expect( span.to_html ).to eq('<span>hello</span>')
    expect( span.to_html ).to eq('<span>hello</span>')
    span_html = ProseDiff::Node.HTML(span.to_html)
    expect( span.to_html ).to eq('<span>hello</span>')
    spanspan = span.dup
    expect( span.dup.to_html ).to eq('<span>hello</span>')
    expect( spanspan.name ).to eq('span')
  end

end