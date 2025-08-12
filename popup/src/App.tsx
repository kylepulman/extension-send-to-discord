import * as z from 'zod'
import { useEffect, useState, type FormEventHandler } from 'react'
import { Heading } from './components/heading'
import { ErrorMessage, Field, Fieldset, Label, Legend } from './components/fieldset'
import { FieldGroup } from './components/fieldset'
import { Text } from './components/text'
import { Input } from './components/input'
import { Button } from './components/button'

const Data = z.object({
  message: z.templateLiteral([z.string().max(100), '<url>', z.string().max(100)]),
  channelId: z.string().length(19),
  apiKey: z.string().min(1).max(100)
})

type Data = z.infer<typeof Data>

async function setStorage(data: Data) {
  console.log(data)

  localStorage.setItem('sendToDiscord', JSON.stringify(data))

  try {
    await chrome.storage.local.set(data)
  } catch (error) {
    console.error('Failed to set extension storage:', error)
  }
}

async function getStorage(): Promise<Data> {
  try {
    console.log('trying extension storage')
    return await chrome.storage.local.get()
  } catch (_error) {
    console.log('using local storage')
    return JSON.parse(localStorage.getItem('sendToDiscord') ?? '{}')
  }
}

function App() {
  const [zodError, setZodError] = useState<z.ZodError>()

  function handleSubmit(): FormEventHandler<HTMLFormElement> {
    return async (event) => {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)

      const data = Object.fromEntries(formData.entries()) as Data

      try {
        Data.parse(data)

        await setStorage(data)
      } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
          setZodError(error)
        }
      }
    }
  }

  const [data, setData] = useState<Data>({
    message: '<url>',
    channelId: '',
    apiKey: ''
  })

  useEffect(() => {
    getStorage().then(storedData => {
      console.log(storedData)

      setData({
        message: storedData.message,
        channelId: storedData.channelId,
        apiKey: storedData.apiKey
      })
    })
  }, [])

  function isInvalid(name: string) {
    return zodError?.issues.some(issue => issue.path.includes(name))
  }

  function invalidMessage(name: string) {
    return zodError
      ?.issues
      .filter(issue => issue.path.includes(name))
      .map((issue, i) => <ErrorMessage key={i}>{issue.message}: {issue.code}</ErrorMessage>)
  }

  return (
    <>
      <form className='p-2 m-2' onSubmit={handleSubmit()}>
        <Heading>Send to Discord</Heading>
        <Fieldset>
          <Legend>Extension Information</Legend>
          <Text>Please supply the following to use the extension.</Text>
          <FieldGroup>
            <Field>
              <Label>Message</Label>
              <Input
                name="message"
                value={data.message}
                onChange={(e) => { setData({ ...data, message: e.currentTarget.value as Data['message'] }) }}
                invalid={isInvalid('message')}
              />
              {isInvalid('message') && invalidMessage('message')}
            </Field>
            <Field>
              <Label>Channel ID</Label>
              <Input
                name="channelId"
                value={data.channelId}
                onChange={(e) => { setData({ ...data, channelId: e.currentTarget.value }) }}
                invalid={isInvalid('channelId')}
              />
              {isInvalid('channelId') && invalidMessage('channelId')}
            </Field>
            <Field>
              <Label>API Key</Label>
              <Input
                name="apiKey"
                type="password"
                value={data.apiKey}
                onChange={(e) => { setData({ ...data, apiKey: e.currentTarget.value }) }}
                invalid={isInvalid('apiKey')}
              />
              {isInvalid('apiKey') && invalidMessage('apiKey')}
            </Field>
          </FieldGroup>
        </Fieldset>
        <Button type="submit" className='my-6'>Save</Button>
      </form>
    </>
  )
}

export default App
