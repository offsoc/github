require 'spec_helper'

describe "Normalizing html for tests" do

  it "should not care about the order of attributes" do
    a = %Q{<h1><a name="ship-it-octocat" class="anchor" href="#ship-it-octocat"></a>Ship it</h1>}
    b = %Q{<h1><a class="anchor" name="ship-it-octocat" href="#ship-it-octocat"></a>Ship it</h1>}
    expect( normalize(a) ).to eq(normalize(b))
  end

end
