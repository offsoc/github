require 'prose_diff/html'
require 'prose_diff/lcs'
require 'prose_diff/diff'

any_have = lambda do |node, message|
   ProseDiff::Node.send(message, node) || node.children.any? { |child| any_have.call(child, message) }
  end


describe ProseDiff::Diff do

  it 'should work for empty strings' do
    c = ProseDiff::Diff.new('<p></p>', '<p></p>').node_set
    expect( c.inner_html ).to eq('')
  end

  it 'should work for an unchanged word' do
    c = ProseDiff::Diff.new('<p>Thomas</p>', '<p>Thomas</p>').node_set
    expect( c.inner_text ).to eq('Thomas')
  end

  it 'should do a sensible thing with LCS' do
    a, b = ProseDiff::Node.HTML('<p><span>Got</span></p>'), ProseDiff::Node.HTML('<p><span>Milk</span></p>')
    aa, bb = ProseDiff::LCS.fold_diff ProseDiff::Node.method(:appear_to_correspond?), a.to_a, b.to_a, [] do |acc, left, right|
      acc << [left, right]
    end
    aa, bb = aa.map { |n| n && n.to_html }, bb.map { |n| n && n.to_html }
    expect( aa ).to eq(['<p><span>Got</span></p>', nil])
    expect( bb ).to eq([nil, '<p><span>Milk</span></p>'])
  end

  it 'should properly differentiate' do
    x1, x2 = ProseDiff::Node.HTML('<p><span>Cougat</span></p>').first, ProseDiff::Node.HTML('<p><span>Cougat</span></p>').first
    expect( ProseDiff::Node.has_same_content_as?(x1, x2) ).to be_truthy
    expect( ProseDiff::Node.appear_to_correspond?(x1, x2) ).to be_truthy
  end

  it 'should properly differentiate' do
    x1, x2 = ProseDiff::Node.HTML('<p><span>Xavier</span></p>').first, ProseDiff::Node.HTML('<p><span>Cougat</span></p>').first
    expect( ProseDiff::Node.has_same_content_as?(x1, x2) ).to be_falsey
    expect( ProseDiff::Node.appear_to_correspond?(x1, x2) ).to be_falsey
  end

  it 'should split without creating removeds' do
    a = ProseDiff::Node.HTML('<p><span>Yodel</span></p>').first
    as = ProseDiff::Node.split_children(a)
    expect( as.any? { |_|  any_have.call(_, :was_removed?) } ).to be_falsey
    expect( as.first.to_html ).to eq('<span>Yodel</span>')
  end

  it 'should split at the same level' do
    x, y = ProseDiff::Node.HTML('<p><span><span data-github-clazz="word">Yodel</span></span></p>').first.children.first, ProseDiff::Node.HTML('<p><span><span data-github-clazz="word">Yodel</span></span></p>').first.children.first
    z = ProseDiff::Node.diff_children(x, y, {})
  end

end