export class KeyboardHandler {
  constructor() {
    this.shortcuts = new Map()
  }

  activate() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  serializeShortcut({key, metaKey, shiftKey, altKey, ctrlKey}) {
    return `${key.toLowerCase()}-${metaKey ? '1' : '0'}-${shiftKey ? '1' : '0'}-${altKey ? '1' : '0'}-${ctrlKey ? '1' : '0'}`
  }

  registerShortcut(shortcut) {
    const serializedKey = this.serializeShortcut(shortcut)
    this.shortcuts.set(serializedKey, shortcut.func)
  }

  handleKeyDown(event) {
    const serializedEventKey = this.serializeShortcut({
      key: event.key,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey
    })

    if (this.shortcuts.has(serializedEventKey)) {
      event.preventDefault()
      const func = this.shortcuts.get(serializedEventKey)
      func()
    }
  }

}