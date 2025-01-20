require 'spec_helper'

describe "Empty spans" do

  before do
    @eg1 = %Q{<p><span class="foo"></span></p>}
    @eg2 = %Q{<p>foo<span class="octicon octicon-link"></span></p>}
    @n1 = ProseDiff::Node.HTML(@eg1).first
    @n2 = ProseDiff::Node.HTML(@eg2).first
  end

  it 'should let an empty span fall through transformations' do
    expect( normalize(ProseDiff::Transformer.transform_document(:after_all, @eg1)) ).to eq( %Q{<div class="expandable unchanged">#{normalize(@eg1)}</div>} )
  end

  it 'should correspond to itself' do
    expect( ProseDiff::Node.appear_to_correspond?(@n1, @n1) ).to be_truthy
  end

  it 'should let an empty span fall through comparisons' do
    expect(
      normalize(ProseDiff.html(@eg1, @eg1))
    ).to eq(
      %Q{<div class="expandable unchanged">#{normalize(@eg1)}</div>}
    )
  end

  it 'should let an empty span following plain text fall through' do
    expect(
      normalize(ProseDiff.html(@eg2, @eg2))
    ).to eq(
      %Q{<div class="expandable unchanged">#{normalize(@eg2)}</div>}
    )
  end

  describe "the original html heading" do

    it 'work for the original' do
      broken = <<HTML
      <h1>
        <a name="ship-it-octocat" class="anchor" href="#ship-it-octocat">
          <span class="octicon octicon-link"></span>
        </a>
        Ship it
      </h1>
HTML
      expect(
        normalize(ProseDiff.html(broken, broken))
      ).to eq(
        %Q{<div class="expandable unchanged">#{normalize(broken)}</div>}
      )
    end

    it 'should work without indents' do
      broken = <<HTML
<h1>
<a name="ship-it-octocat" class="anchor" href="#ship-it-octocat">
<span class="octicon octicon-link"></span>
</a>
Ship it
</h1>
HTML
      expect(
        normalize(ProseDiff.html(broken, broken))
      ).to eq(
        %Q{<div class="expandable unchanged">#{normalize(broken)}</div>}
      )
    end

    it 'should work text before the span' do
      broken = <<HTML
<h1><a name="ship-it-octocat" class="anchor" href="#ship-it-octocat">text<span class="octicon octicon-link"></span></a>Ship it</h1>
HTML
      expect(
        normalize(ProseDiff.html(broken, broken))
      ).to eq(
        %Q{<div class="expandable unchanged">#{normalize(broken)}</div>}
      )
    end

    it 'should work text after the span' do
      broken = <<HTML
<h1><a name="ship-it-octocat" class="anchor" href="#ship-it-octocat"><span class="octicon octicon-link"></span>text</a>Ship it</h1>
HTML
      expect(
        normalize(ProseDiff.html(broken, broken))
      ).to eq(
        %Q{<div class="expandable unchanged">#{normalize(broken)}</div>}
      )
    end

  end

end
