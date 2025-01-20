require 'spec_helper'

describe "image alternate descriptions" do

  it "should register a change" do

    afters = ProseDiff::Diff.new("<p><img src='foo' alt='foo'/></p>", "<p><img src='foo' alt='bar'/></p>").node_set

    expect( afters.to_html ).not_to eq("<p class=\"changed\"><img class=\"unchanged changed_alt\" src=\"foo\" alt=\"bar\"></p>")

    expect( normalize(ProseDiff::Transformer.transform_document(:after_all, afters).to_html) ).to eq( normalize('<div class="changed"><p><img class="changed changed_alt" src="foo" alt="bar"></p></div>') )

  end

end