import {AiFunctions} from '@sx/analyze/ai-functions'
import handleMessages from '@sx/analyze/listeners'
import {AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'


describe('handleMessages', () => {
  it('should return if message type is not defined', async () => {
    const result = await handleMessages({})
    expect(result).toBeUndefined()
  })

  it.each([
    AiProcessMessageType.updated,
    AiProcessMessageType.completed,
    AiProcessMessageType.failed
  ])('should process OpenAI response if message type is %s', async (type) => {
    const message = {
      type
    }
    const spy = jest.spyOn(AiFunctions.prototype, 'processOpenAIResponse')
    await handleMessages(message)
    expect(spy).toHaveBeenCalledWith(message)
  })
})
