import * as fs from 'fs'
import OpenAI from 'openai'


const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY})


class PullRequestReviewer {
  async retrieveFile() {
    return await fs.promises.readFile('./diff.txt', 'utf8')
  }

  async createThread() {
    return client.beta.threads.create({
        messages: [{
          role: 'user',
          content: await this.retrieveFile()
        }]
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
reviewer.review().then(console.log)
