export type State = {
  isOn: boolean
  seconds: number
  tab: chrome.tabs.Tab | undefined
  content: string[]
  urls: string[]
}
