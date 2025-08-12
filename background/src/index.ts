type Data = {
  message: string
  channelId: string
  apiKey: string
}

console.log('Hello background script!')

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Send to Discord',
    contexts: ['image'],
    id: 'image',
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  void (async () => {
    if (info.menuItemId !== 'image') return

    const url = info.srcUrl

    if (!url) {
      console.error('Select element cannot provide a valid URL')
      return
    }

    const data = await chrome.storage.local.get<Data>()

    try {
      const response = await fetch(`https://api.kylepulman.com/discord/broadcast/${data.channelId}`, {
        method: 'POST',
        headers: {
          'Authorization': data.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.message.replace('<url>', url),
        }),
      })

      const result = await response.text()

      if (response.status !== 200) {
        throw new Error(JSON.stringify(result))
      }

      console.log(result)
    }
    catch (error) {
      console.error(error)
      return
    }
  })()
})
