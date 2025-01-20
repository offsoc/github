require 'spec_helper'

describe ProseDiff::Transformer::Vicinity do

  describe 'regression error' do

    it 'should arrayize ["article", "section", "body"]' do
      expect( ProseDiff::Transformer::Vicinity.new.send(:arrayize, ["article", "section", "body"])).to eq(["article", "section", "body"])
    end
  end

  describe 'where_parented_by_and_analyses_are' do

    it 'should handle multiple names' do
      q = ProseDiff::Transformer::Vicinity.new.send :where_parented_by_and_analyses_are,
        'body',
        'changed',
        'p',
        'div'

      expect( q ).to eq(%Q{//body/p[@data-github-analysis='changed']|//body/div[@data-github-analysis='changed']})
    end

    it 'should handle multiple parents' do
      q = ProseDiff::Transformer::Vicinity.new.send :where_parented_by_and_analyses_are,
        %w{body article},
        'changed',
        'p',
        'div'

      expect( q ).to eq(%Q{//body/p[@data-github-analysis='changed']|//body/div[@data-github-analysis='changed']|//article/p[@data-github-analysis='changed']|//article/div[@data-github-analysis='changed']})
    end

  end

  describe 'transformations' do

    it 'should transform a direct child of an article' do

      transformed = ProseDiff::Transformer.transform_document(ProseDiff::Transformer::Vicinity, <<'HTML')
<article>
  <p>One</p>
  <p>Two</p>
  <p data-github-analysis='added'>Between</p>
  <p>Three</p>
</article>
HTML

      expect( normalize(transformed) ).to eq(normalize(<<'RESULT'))
<article>
  <p>One</p>
  <p class="vicinity">Two</p>
  <p data-github-analysis='added'>Between</p>
  <p class="vicinity">Three</p>
</article>
RESULT

    end

    it 'should transform a direct child INS of an article' do

      transformed = ProseDiff::Transformer.transform_document(ProseDiff::Transformer::Vicinity, <<'HTML')
<article>
  <p>One</p>
  <p>Two</p>
  <ins>Between</ins>
  <p>Three</p>
</article>
HTML

      expect( normalize(transformed) ).to eq(normalize(<<'RESULT'))
<article>
  <p>One</p>
  <p class="vicinity">Two</p>
  <ins>Between</ins>
  <p class="vicinity">Three</p>
</article>
RESULT

    end

    it 'should not transform a grand child of an article' do

      transformed = ProseDiff::Transformer.transform_document(ProseDiff::Transformer::Vicinity, <<'HTML')
<article>
  <p>One</p>
  <p>Two</p>
  <div data-github-analysis='changed'>
    <ol data-github-analysis='changed'>
      <li data-github-analysis='added'>Between</li>
    </ol>
  </div>
  <p>Three</p>
</article>
HTML

      expect( normalize(transformed) ).to eq(normalize(<<'RESULT'))
<article>
  <p>One</p>
  <p class="vicinity">Two</p>
  <div data-github-analysis='changed'>
    <ol data-github-analysis='changed'>
      <li data-github-analysis='added'>Between</li>
    </ol>
  </div>
  <p class="vicinity">Three</p>
</article>
RESULT

    end

  end

end