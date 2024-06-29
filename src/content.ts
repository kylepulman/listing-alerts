;(async () => {
  location.reload()

  const randomInt = Math.floor(Math.random() * 5)
  let content: string[] = ['1', '2', '3']
  if (randomInt === 1) content[0] = '0'

  await chrome.runtime.sendMessage({ content })
})()
