import {AiProcessMessage, AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'

import {logError} from '../utils/log-error'
import sleep from '../utils/sleep'


export class CommentBox {
  static resizeToFitContent(textarea: HTMLInputElement): void {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  static async getCommentBox(): Promise<HTMLInputElement> {
    const commentBox = document.querySelector('.textfield') as HTMLInputElement
    let inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]') as HTMLInputElement
    if (commentBox && !inputFieldParent) {
      commentBox.click()
      const QUICK = 100 // ms
      await sleep(QUICK)
      inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]') as HTMLInputElement
    }
    return inputFieldParent
  }

  static async populate(text: string): Promise<void> {
    if (text === undefined) {
      return
    }

    const commentBox = await this.getCommentBox() as HTMLInputElement
    commentBox.value = commentBox.value + text
    this.resizeToFitContent(commentBox)
  }

  static async clear() {
    const commentBox = await this.getCommentBox()
    commentBox.value = ''
    this.resizeToFitContent(commentBox)
  }
}


chrome.runtime.onMessage.addListener((request: AiProcessMessage) => {
  if (request.type === AiProcessMessageType.updated && request.data) {
    CommentBox.populate(request.data.content).catch(logError)
  }
  if (request.type === AiProcessMessageType.failed) {
    CommentBox.clear().catch(logError)
  }
})
