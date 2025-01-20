describe ProseDiff::Node do
  
  describe "proxies" do
    
    it 'should do something half-way obvious' do
      
      i1 = ProseDiff::Node.HTML('<img src="./foo.png"/>').first
      i2 = ProseDiff::Node.HTML('<img src="./foo.png"/>').first
      
      ProseDiff::Node.has_same_content_as? i1, i2
    end
    
  end
  
end