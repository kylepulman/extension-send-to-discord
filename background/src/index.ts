console.log('Hello background script!')

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Send to Discord',
    contexts: ['image'],
    id: 'image'
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'image') return

  const url = info.srcUrl

  if (!url) {
    console.error('Select element cannot provide a valid URL')
    return
  }

  try {
    const response = await fetch('https://api.kylepulman.com/discord/broadcast/1404140879714848865', {
      method: 'POST',
      headers: {
        'Authorization': 'QfgZSy0Bero/ede6xY1DnA==',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `Check out this image: ${url}`
      })
    })

    const result = await response.text()

    if (response.status !== 200) {
      throw result
    }

    console.log(result)
  }
  catch (error) {
    console.error(error)
    return
  }
})