require 'prose_diff/diff'
require 'prose_diff/node/node'

merge = lambda do |arr|
  if arr.empty?
    arr
  else
    ProseDiff::Node.unsplit_all arr[0], arr[1..-1]
  end
end


describe ProseDiff::Diff do
  
  it "should cleanly unsplit plain spans" do
    x = ProseDiff::Node.HTML('<p><span>Milk</span><span>Of</span><span>Magnesia</span></p>').first
    expect( merge.call(x.children).to_html ).to eq('<span>MilkOfMagnesia</span>')
  end
  
  it "should not unsplit an add with a plain" do
    xes = ProseDiff::Node.HTML('<p>Hello <span data-github-clazz="word" data-github-analysis="removed">Git </span><span data-github-clazz="word" data-github-analysis="added">Smart </span>Hub</p>').first.children
    expect( merge.call(xes).to_html ).to eq('Hello <span data-github-clazz="word" data-github-analysis="removed">Git </span><span data-github-clazz="word" data-github-analysis="added">Smart </span>Hub')
  end
  
  it "should not unsplit an add with a plain" do
    xes2 = ProseDiff::Node.HTML('<p><span data-github-clazz="word" data-github-analysis="added">Smart </span>Hub</p>').first.children
    expect( merge.call(xes2).to_html ).to eq('<span data-github-clazz="word" data-github-analysis="added">Smart </span>Hub')
  end
  
  it "should not unsplit an add with a plain" do
    added = ProseDiff::Node.HTML('<p><span data-github-clazz="word" data-github-analysis="added">Smart </span></p>').first.children.first
    plain = ProseDiff::Node.HTML('<p>Hub</p>').first.children.first
    expect( ProseDiff::Node.unsplit(added, plain).to_html ).to eq('<span data-github-clazz="word" data-github-analysis="added">Smart </span>Hub')
  end
  
  it 'should unsplit anchors' do
    aa = ProseDiff::Node.HTML("<p><a class=\"removed\" href=\"http://daftpunk.com/\">Daft </a><a class=\"removed\" href=\"http://daftpunk.com/\">Punk</a></p>").first.children
    
    a = ProseDiff::Node.unsplit(aa[0], aa[1])
    
    expect( a.to_html ).to eq("<a class=\"removed\" href=\"http://daftpunk.com/\">Daft Punk</a>")
  end
  
end