import extractText from '@sx/utils/extract-text'


describe('Extract Text', () => {
  it('should extract text from HTML content', () => {
    const htmlContent: string = '<div class="some class">Some<br> Text</div>'
    const text = extractText(htmlContent)
    expect(text).toBe('Some Text')
  })
})
