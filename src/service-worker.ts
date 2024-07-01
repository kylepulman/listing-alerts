import { type State } from './lib.js'

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.clear()

  const state: State = {
    isOn: false,
    seconds: 0,
    tab: undefined,
    content: [],
    urls: ['https://www.kylepulman.com/'],
  }

  await chrome.action.setBadgeText({ text: 'OFF' })

  await chrome.storage.sync.set(state)
})

chrome.storage.onChanged.addListener(async (changes) => {
  const state = (await chrome.storage.sync.get(null)) as State

  if (changes.isOn) {
    if (changes.isOn.newValue === true) {
      await chrome.action.setBadgeText({ text: 'ON' })
      await chrome.alarms.create('timer', {
        delayInMinutes: state.seconds / 60,
      })
    } else {
      await chrome.action.setBadgeText({ text: 'OFF' })
      await chrome.alarms.clear('timer')
    }
  }
})

chrome.alarms.onAlarm.addListener(async () => {
  const state = (await chrome.storage.sync.get(null)) as State

  state.isOn = false

  await chrome.storage.sync.set(state)

  if (!state.tab?.id) return

  await chrome.scripting.executeScript({
    target: { tabId: state.tab.id },
    files: ['content.js'],
  })
})

chrome.runtime.onMessage.addListener(async (message, sender) => {
  const state = (await chrome.storage.sync.get(null)) as State

  if (!sender.url?.startsWith('chrome')) {
    const isUpdate = state.content.some((item, i) => item !== message.content[i])

    if (!isUpdate) {
      console.log('Resetting timer...')
      state.isOn = true
      state.content = message.content
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'New listing found!',
        message: 'Click here to focus the tab.',
        priority: 0,
        requireInteraction: true,
      })
    }
  }

  await chrome.storage.sync.set(state)
})

chrome.notifications.onClicked.addListener(async () => {
  const state = (await chrome.storage.sync.get(null)) as State

  if (!state.tab?.windowId || !state.tab.id) return

  await chrome.windows.update(state.tab.windowId, { focused: true })
  await chrome.tabs.update(state.tab.id, { active: true })
})
