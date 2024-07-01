import { type State } from './lib.js'

window.onload = async () => {
  const state = await chrome.storage.sync.get(null)

  const form = document.getElementById('form') as HTMLFormElement
  const urls = form.elements.namedItem('urls') as HTMLSelectElement
  const seconds = form.elements.namedItem('seconds') as HTMLInputElement
  const submit = form.elements.namedItem('submit') as HTMLButtonElement

  if (state.isOn === true) {
    urls.value = state.tab.url
    urls.disabled = true
    seconds.value = state.seconds
    seconds.disabled = true
    submit.textContent = 'Stop'
  } else {
    submit.textContent = 'Start'
  }

  state.urls.forEach((url: string) => {
    const option = document.createElement('option')

    option.value = url
    option.textContent = url

    form.urls.appendChild(option)
  })

  form.onsubmit = async (event: Event) => {
    event.preventDefault()

    const state = (await chrome.storage.sync.get(null)) as State

    state.isOn = !state.isOn
    state.seconds = JSON.parse(seconds.value)
    state.tab = (await chrome.tabs.query({ url: urls.value }))[0]
    if (!state.tab) state.tab = await chrome.tabs.create({ url: urls.value, active: false })

    await chrome.storage.sync.set(state)

    window.close()
  }
}
