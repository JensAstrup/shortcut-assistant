import * as fs from 'fs'
import OpenAI from 'openai'


const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY})


class PullRequestReviewer {
  async retrieveFile() {
    const data = await fs.promises.readFile('./diff.txt', 'utf8')
    return data
  }

  async createThread() {
    const messages = [{
      role: 'user',
      content: await this.retrieveFile()
    }]
    return client.beta.threads.create({
      messages: messages
      }
    )
  }

  async runThread() {
    const thread = await this.createThread()
    const run = await client.beta.threads.runs.create(
      thread.id,
      {assistant_id: 'asst_rT9Jf2KyaPezH88ELvs8SfZ9'}
    )
    return {run: run, threadId: thread.id}
  }

  async retrieveThread(runId, threadId) {
    return client.beta.threads.runs.retrieve(threadId, runId)
  }

  async review() {
    let {run, threadId} = await reviewer.runThread()
    while (!['cancelled', 'failed', 'completed', 'expired'].includes(run.status)) {
      run = await reviewer.retrieveThread(run.id, threadId)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    const messages = await client.beta.threads.messages.list(
      threadId
    )
    return messages.data[0].content[0].text.value

  }
}


const reviewer = new PullRequestReviewer()
const output = await reviewer.review()
const encodedOutput = Buffer.from(output).toString('base64')
console.log(encodedOutput)
