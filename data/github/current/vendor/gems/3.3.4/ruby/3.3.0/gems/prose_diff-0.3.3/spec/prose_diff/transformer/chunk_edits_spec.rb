require 'spec_helper'

describe ProseDiff::Transformer::ChunkEdits do

  it 'shouldn\'t change an unchanged thing' do
    html = <<'UNCHANGED'
<p>One</p>
<p data-github-analysis="unchanged">Two</p>
<p>Three</p>
UNCHANGED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(html) )
  end

  it 'shouldn\'t change a thing with an addition' do
    html = <<'UNCHANGED'
<p>One</p>
<p data-github-analysis="added">Two</p>
<p>Three</p>
UNCHANGED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(html) )
  end

  it 'shouldn\'t change a thing with a removal followed by an addition' do
    html = <<'UNCHANGED'
<p>One</p>
<p data-github-analysis="removed">Two</p>
<p data-github-analysis="added">Three</p>
<p>Four</p>
UNCHANGED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(html) )
  end

  it 'should reorder an addition followed by a removal' do
    html = <<'UNCHANGED'
<p>One</p>
<p data-github-analysis="added">Two</p>
<p data-github-analysis="removed">Three</p>
<p>Four</p>
UNCHANGED
    expected = <<'REDORDERED'
<p>One</p>
<p data-github-analysis="removed">Three</p>
<p data-github-analysis="added">Two</p>
<p>Four</p>
REDORDERED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(expected) )
  end

  it 'should reorder two removals followed by additions' do
    html = <<'UNCHANGED'
<p>One</p>
<p data-github-analysis="removed">Two</p>
<p data-github-analysis="added">Three</p>
<p data-github-analysis="removed">Four</p>
<p data-github-analysis="added">Five</p>
UNCHANGED
    expected = <<'REDORDERED'
<p>One</p>
<p data-github-analysis="removed">Two</p>
<p data-github-analysis="removed">Four</p>
<p data-github-analysis="added">Three</p>
<p data-github-analysis="added">Five</p>
REDORDERED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(expected) )
  end

  it "shouldn't break an existing example" do
    html = <<'UNCHANGED'
<p><img src="./a/link/yo/an.image.jpg" alt="a title"></p>
UNCHANGED
    expected = <<'REDORDERED'
<p><img src="./a/link/yo/an.image.jpg" alt="a title"></p>
REDORDERED
    na = ProseDiff::Node.HTML(html).to_a
    ProseDiff::Transformer.transform_nodes(ProseDiff::Transformer::ChunkEdits, na, {})
    result = na.map(&:to_html).join('')
    expect( normalize(result) ).to eq( normalize(expected) )
  end

  it "should re-order and merge inline examples" do
    result = ProseDiff.html <<'BEFORE', <<'AFTER'
<p>irure dolor in reprehenderit in voluptate velit esse One Two Three Four Five</p>
BEFORE
<p>irure dolor in reprehenderit in voluptate velit esse One Two 3 4 Five</p>
AFTER
    expected = <<'EXPECTED'
<div class="changed"><p>irure dolor in reprehenderit in voluptate velit esse One Two <del>Three Four</del><ins>3 4</ins> Five</p></div>
EXPECTED
    expect( normalize(result) ).to eq( normalize(expected) )
  end

end