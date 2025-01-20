require 'spec_helper'

describe "<em/>" do
  
  it "splitting an em with a single word should be a NOOP" do
    
    em = ProseDiff::Node.HTML('<p><em>Hello</em></p>').first.children.first
    
    split_ems = ProseDiff::Node.split(em)
    
    expect( split_ems.to_html ).to eq(em.to_html)
    
  end
  
  it "diffing within a word-space pair shouldn't produce an insertion" do
    
    without_em = ProseDiff::Node.HTML('<p>Hello There</p>').first.children.first
    
    with_em_plural = ProseDiff::Node.HTML('<p><em>Hello</em> There</p>').first.children
    
    split_without_em = ProseDiff::Node.split(without_em)
    
    expect( split_without_em.to_html ).to eq("<span data-github-clazz=\"word\">Hello</span><span data-github-clazz=\"unword\"> </span><span data-github-clazz=\"word\">There</span>")
    
    d = ProseDiff::Diff.new('<p>Hello There</p>', '<p><em>Hello</em> There</p>').node_set
    
  end
  
      
end