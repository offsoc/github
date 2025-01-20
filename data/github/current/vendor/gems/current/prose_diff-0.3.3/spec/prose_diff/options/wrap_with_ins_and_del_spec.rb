require 'spec_helper'

describe ProseDiff::Transformer::Wrap do

  describe 'with whitespace' do

    it 'should do the default thing' do
      result = ProseDiff.html <<'BEFORE', <<'AFTER'
<p id="foo">One Two Three</p>
BEFORE
<p id="foo">One 2 Three</p>
AFTER
      expected = <<'EXPECTED'
<div class="changed"><p id="foo">One <del>Two</del><ins>2</ins> Three</p></div>
EXPECTED
      expect( normalize(result) ).to eq( normalize(expected) )
    end

  end

  describe 'without whitespace' do

    before do
      @corpus = %Q{<p><em data-github-analysis="removed">old</em><strong data-github-analysis="added">new</strong></p>}
    end

    it 'should do the default thing' do
      h2 = ProseDiff::Transformer.transform_document(
             ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus)
           ).to_html
      expect( h2 ).to eq( %Q{<p><del data-github-analysis="removed"><em data-github-analysis="removed">old</em></del><ins data-github-analysis="added"><strong data-github-analysis="added">new</strong></ins></p>} )
    end

    it 'should allow exceptions to the default' do
      h2 = ProseDiff::Transformer.transform_document(
             ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
             wrap: {
               'removed,added' => {except: 'strong'}
             }
           ).to_html
      expect( h2 ).to eq( %Q{<p><del data-github-analysis="removed"><em data-github-analysis="removed">old</em></del><strong data-github-analysis="added">new</strong></p>} )
    end

    it 'should allow restricting the list' do
      h2 = ProseDiff::Transformer.transform_document(
         ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
         wrap: {
           'removed,added' => {only: 'strong'}
         }
       ).to_html
      expect( h2 ).to eq( %Q{<p><em data-github-analysis="removed">old</em><ins data-github-analysis="added"><strong data-github-analysis="added">new</strong></ins></p>} )
    end

    it 'should allow restricting the list with a list' do
      h2 = ProseDiff::Transformer.transform_document(
             ProseDiff::Transformer::Wrap, ProseDiff::Node.HTML(@corpus),
             wrap: {
               'removed,added' => {only: %w{strong strike}}
             }
           ).to_html
      expect( h2 ).to eq( %Q{<p><em data-github-analysis="removed">old</em><ins data-github-analysis="added"><strong data-github-analysis="added">new</strong></ins></p>} )
    end

  end

end