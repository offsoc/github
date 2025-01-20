require 'spec_helper'

describe 'version' do
  before do
    @was_verison = Gem.loaded_specs['prose_diff'].version
  end
  after do
    Gem.loaded_specs['prose_diff'].version = @was_verison
  end

  it 'should report the name omitting leading zeroes if there is no suffix' do
    Gem.loaded_specs['prose_diff'].version = '0.0.3'
    expect( ProseDiff.output_version(false)).to eq('3')
    Gem.loaded_specs['prose_diff'].version = '0.2.3'
    expect( ProseDiff.output_version(false)).to eq('2.3')
    Gem.loaded_specs['prose_diff'].version = '1.2.3'
    expect( ProseDiff.output_version(false)).to eq('1.2.3')
  end

  it 'should report the suffix' do
    Gem.loaded_specs['prose_diff'].version = '0.0.3.abc234'
    expect( ProseDiff.output_version(false)).to eq('abc234')
    Gem.loaded_specs['prose_diff'].version = '0.2.3.abc234'
    expect( ProseDiff.output_version(false)).to eq('abc234')
    Gem.loaded_specs['prose_diff'].version = '1.2.3.abc234'
    expect( ProseDiff.output_version(false)).to eq('abc234')
  end
end