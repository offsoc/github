require 'spec_helper'

describe ProseDiff::Transformer::Wrap do

  before do
    @corpus = %Q{<p data-github-analysis="changed">old</p><ol data-github-analysis="added"><li>item</li></ol>}
  end

  it 'should do the default thing' do
    h2 = ProseDiff::Transformer.transform_document(
           ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
           wrap: {
             'removed, added' => {only: []}
           }
         ).to_html.gsub(/\n/,'')
    expect( h2 ).to eq( %Q{<div data-github-analysis="changed"><p data-github-analysis="changed">old</p></div><ol data-github-analysis="added"><li>item</li></ol>} )
  end

  it 'should allow exceptions to the default' do
    h2 = ProseDiff::Transformer.transform_document(
           ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
           wrap: {
             'removed, added' => {only: []},
             changed: {except: %w{p}}
           }
         ).to_html.gsub(/\n/,'')
    expect( h2 ).to eq( %Q{<p data-github-analysis="changed">old</p><ol data-github-analysis="added"><li>item</li></ol>} )
  end

  it 'should override the default \'with\'' do
    h2 = ProseDiff::Transformer.transform_document(
           ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
             wrap: {
               added: {
                 only: 'ol',
                 except: [],
                 with: 'div'
               }
             }
         ).to_html.gsub(/\n/,'')
    expect( h2 ).to eq( %Q{<div data-github-analysis="changed"><p data-github-analysis="changed">old</p></div><div data-github-analysis="added"><ol data-github-analysis="added"><li>item</li></ol></div>} )
  end

end