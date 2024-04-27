// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {chrome} from 'jest-chrome'


beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {
  })
  jest.spyOn(console, 'warn').mockImplementation(() => {
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})
