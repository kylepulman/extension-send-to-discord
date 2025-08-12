import { useEffect, useState, type FormEventHandler } from 'react'
import { Heading } from './components/heading'
import { Field, Fieldset, Label, Legend } from './components/fieldset'
import { FieldGroup } from './components/fieldset'
import { Text } from './components/text'
import { Input } from './components/input'
import { Button } from './components/button'

type Data = {
  message: string
  channelId: string
  apiKey: string
}

async function setStorage(data: Data) {
  try {
    console.log('trying extension storage')
    await chrome.storage.local.set(data)
  } catch (_error) {
    console.log('using local storage')
    localStorage.setItem('sendToDiscord', JSON.stringify(data))
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
  function handleSubmit(): FormEventHandler<HTMLFormElement> {
    return async (event) => {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)

      const data = Object.fromEntries(formData.entries()) as Data

      await setStorage(data)
    }
  }

  const [data, setData] = useState<Data>({
    message: '',
    channelId: '',
    apiKey: ''
  })

  useEffect(() => {
    getStorage().then(storedData => setData(storedData))
  }, [])

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
              <Input name="message" defaultValue={data.message} />
            </Field>
            <Field>
              <Label>Channel ID</Label>
              <Input name="channelId" defaultValue={data.channelId} />
            </Field>
            <Field>
              <Label>API Key</Label>
              <Input name="apiKey" type="password" defaultValue={data.apiKey} />
            </Field>
          </FieldGroup>
        </Fieldset>
        <Button type="submit" className='my-6'>Save</Button>
      </form>
    </>
  )
}

export default App
