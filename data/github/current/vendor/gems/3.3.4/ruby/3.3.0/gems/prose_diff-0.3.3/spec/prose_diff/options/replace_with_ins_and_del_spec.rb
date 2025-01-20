require 'spec_helper'

describe ProseDiff::Transformer::Replace do

  it 'should replace the element by default' do
    h1 = %Q{<p><span data-github-analysis="removed">old</span><span data-github-analysis="added">new</span></p>}
    h2 = ProseDiff::Transformer.transform_document(
           ProseDiff::Transformer::Replace, ProseDiff::Node.HTML(h1)
         ).to_html
    expect( h2 ).to eq( %Q{<p><del data-github-analysis="removed">old</del><ins data-github-analysis="added">new</ins></p>} )
  end

  it 'should allow exceptions to the default' do
    h1 = %Q{<p><span data-github-analysis="removed">old</span><span data-github-analysis="added">new</span></p>}
    h2 = ProseDiff::Transformer.transform_document(
           ProseDiff::Transformer::Replace, ProseDiff::Node.HTML(h1),
           replace: {
             'removed, added' => {except: 'span'}
           }
         ).to_html
    expect( h2 ).to eq( %Q{<p><span data-github-analysis="removed">old</span><span data-github-analysis="added">new</span></p>} )
  end

end