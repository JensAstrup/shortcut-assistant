import {CommentBox} from '@sx/comment-box/content-script'


describe('CommentBox', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should resize the textarea to fit the content', () => {
    const textarea = document.createElement('textarea')
    textarea.style.height = 'auto'
    textarea.style.height = '100px'
    expect(textarea.style.height).toBe('100px')
  })

  it('should get the comment box', async () => {
    const commentBox = document.createElement('div')
    commentBox.className = 'textfield'
    document.body.appendChild(commentBox)
    const inputFieldParent = document.createElement('div')
    inputFieldParent.dataset.onMouseup = 'App.Controller.Comment.handleOnMouseUp'
    document.body.appendChild(inputFieldParent)

    const result = await CommentBox.getCommentBox()
    expect(result).toBe(inputFieldParent)
  })

  it('should populate the comment box', async () => {
    const commentBox = document.createElement('textarea') as unknown as HTMLInputElement
    commentBox.value = 'Hello, '
    document.body.appendChild(commentBox)
    jest.spyOn(CommentBox, 'getCommentBox').mockResolvedValue(commentBox)

    await CommentBox.populate('world!')
    expect(commentBox.value).toBe('Hello, world!')
  })

  it('should clear the comment box', async () => {
    const commentBox = document.createElement('textarea') as unknown as HTMLInputElement
    commentBox.value = 'Hello, world!'
    document.body.appendChild(commentBox)
    jest.spyOn(CommentBox, 'getCommentBox').mockResolvedValue(commentBox)

    await CommentBox.clear()
    expect(commentBox.value).toBe('')
  })
})
