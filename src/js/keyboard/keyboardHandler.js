export class KeyboardHandler {
  constructor() {
    this.shortcuts = new Map()
  }

  activate() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  registerShortcut(shortcutKey, callback) {
    if (!this.shortcuts.has(shortcutKey)) {
      this.shortcuts.set(shortcutKey, [])
    }
    this.shortcuts.get(shortcutKey).push(callback)
  }

  handleKeyDown(event) {
    const shortcutKey = this.constructShortcutKeyFromEvent(event)
    if (this.shortcuts.has(shortcutKey)) {
      this.shortcuts.get(shortcutKey).forEach(callback => {
        callback()
      })
    }
  }

  constructShortcutKey(shortcut) {
    return `${shortcut.shiftKey ? 'Shift+' : ''}${shortcut.key}`
  }

  constructShortcutKeyFromEvent(event) {
    let parts = []
    if (event.shiftKey) parts.push('Shift')
    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.metaKey) parts.push('Meta')
    parts.push(event.key.toLowerCase()) // Ensure lowercase for consistency
    return parts.join('+')
  }

}