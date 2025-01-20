require 'spec_helper'

describe "Regression Error" do

  it 'should preserve a strong without whitespace' do
    h = ProseDiff::Diff.new(
      %Q{<p id="1">Lorem</p>},
      %Q{<p id="1">Lorem<strong>foo</strong></p>}
    ).node_set
    expect( h.xpath('//strong') ).not_to be_empty
  end

  it 'should preserve a strong with whitespace' do
    h = ProseDiff::Diff.new(
      %Q{<p id="1">Lorem</p>},
      %Q{<p id="1">Lorem <strong>foo</strong></p>}
    ).node_set
    expect( h.xpath('//strong') ).not_to be_empty
  end

  it "should unsplit a strong with some text" do
    nodes = ProseDiff::Node.HTML(%Q{<p>Lorem <strong>Ipsum</strong></p>}).first.children
    nodes2 = ProseDiff::Node.unsplit_all(nodes.first, nodes[1..-1])
    expect( nodes2.to_html ).to match(/strong/)
  end

  it "should unsplit a strong a span and some text" do
    nodes = ProseDiff::Node.HTML(%Q{<p>Lorem<span> </span><strong>Ipsum</strong></p>}).first.children
    nodes2 = ProseDiff::Node.unsplit_all(nodes.first, nodes[1..-1])
    expect( nodes2.to_html ).to match(/strong/)
  end

  it "should unsplit a strong a whitespace span and some text" do
    nodes = ProseDiff::Node.HTML(%Q{<p>Lorem<span data-github-clazz="unword"> </span><strong>Ipsum</strong></p>}).first.children
    nodes2 = ProseDiff::Node.unsplit_all(nodes.first, nodes[1..-1])
    expect( nodes2.to_html ).to match(/strong/)
  end

  it "should unsplit a strong a whitespace span and some text" do
    nodes = ProseDiff::Node.HTML(%Q{<p>Lorem<span data-github-clazz="unword" data-github-analysis="added"> </span><strong data-github-analysis="added">Ipsum</strong></p>}).first.children
    first, butFirst = nodes.first, nodes[1..-1]
    nodes2 = ProseDiff::Node.unsplit_all(first, butFirst)
    expect( nodes2.to_html ).to match(/strong/)
  end

end
