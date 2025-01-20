describe ProseDiff::Node do

  describe '#text' do

    it 'should report the text for Nokogiri::XML::Text' do
      t = parse('<p>Hello</p>').children.first
      expect(t.text).to eq('Hello')
    end

    it 'should report the text for a paragraph' do
      p = parse('<p>Hello</p>')
      expect(p.text).to eq('Hello')
    end

    it 'should report the text for a list item' do
      li = parse('<ul><li>Hello</li></ul>').children.first
      expect(li.text).to eq('Hello')
    end

    it 'should report the text for a list' do
      l = parse('<ul><li>Hello</li></ul>')
      expect(l.text).to eq('Hello')
    end

  end

end
