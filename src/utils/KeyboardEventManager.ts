import { KeyBinding, KeyboardEventData, KeyboardManagerConfig, DEFAULT_KEY_BINDINGS } from '../types/events';

export class KeyboardEventManager {
  private element: HTMLElement;
  private keyBindings: Map<string, KeyBinding> = new Map();
  private config: KeyboardManagerConfig;
  private actionCallbacks: Map<string, (data: KeyboardEventData) => void> = new Map();

  constructor(config: KeyboardManagerConfig = {}) {
    this.element = config.element || document.body;
    this.config = {
      preventDefaults: true,
      keyBindings: DEFAULT_KEY_BINDINGS,
      ...config,
    };
    
    this.initializeKeyBindings();
    this.bindEvents();
  }

  private initializeKeyBindings(): void {
    this.keyBindings.clear();
    
    this.config.keyBindings?.forEach(binding => {
      const key = this.createKeyBindingKey(binding);
      this.keyBindings.set(key, binding);
    });
  }

  private createKeyBindingKey(binding: KeyBinding): string {
    const modifiers = [
      binding.ctrlKey ? 'ctrl' : '',
      binding.shiftKey ? 'shift' : '',
      binding.altKey ? 'alt' : '',
      binding.metaKey ? 'meta' : '',
    ].filter(Boolean);
    
    return [...modifiers, binding.key.toLowerCase()].join('+');
  }

  private bindEvents(): void {
    this.element.addEventListener('keydown', this.handleKeyDown, true);
    this.element.addEventListener('keyup', this.handleKeyUp, true);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const keyBindingKey = this.createKeyBindingKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      action: '',
      description: '',
    });

    const binding = this.keyBindings.get(keyBindingKey);
    
    if (binding) {
      const eventData: KeyboardEventData = {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation(),
      };

      if (this.config.preventDefaults) {
        event.preventDefault();
        event.stopPropagation();
      }

      const callback = this.actionCallbacks.get(binding.action);
      if (callback) {
        callback(eventData);
      }

      if (this.config.onKeyPress) {
        this.config.onKeyPress(eventData);
      }
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    // Handle key up events if needed for future functionality
  };

  public registerAction(action: string, callback: (data: KeyboardEventData) => void): void {
    this.actionCallbacks.set(action, callback);
  }

  public unregisterAction(action: string): void {
    this.actionCallbacks.delete(action);
  }

  public addKeyBinding(binding: KeyBinding): void {
    const key = this.createKeyBindingKey(binding);
    this.keyBindings.set(key, binding);
  }

  public removeKeyBinding(binding: Partial<KeyBinding>): void {
    if (binding.key) {
      const key = this.createKeyBindingKey(binding as KeyBinding);
      this.keyBindings.delete(key);
    }
  }

  public updateKeyBindings(keyBindings: KeyBinding[]): void {
    this.config.keyBindings = keyBindings;
    this.initializeKeyBindings();
  }

  public getKeyBindings(): KeyBinding[] {
    return Array.from(this.keyBindings.values());
  }

  public getKeyBindingForAction(action: string): KeyBinding | undefined {
    return Array.from(this.keyBindings.values()).find(binding => binding.action === action);
  }

  public hasKeyBinding(keyCombo: string): boolean {
    return this.keyBindings.has(keyCombo.toLowerCase());
  }

  public formatKeyBinding(binding: KeyBinding): string {
    const modifiers = [];
    if (binding.ctrlKey) modifiers.push('Ctrl');
    if (binding.shiftKey) modifiers.push('Shift');
    if (binding.altKey) modifiers.push('Alt');
    if (binding.metaKey) modifiers.push('Meta');
    
    const keyDisplay = binding.key.length === 1 ? binding.key.toUpperCase() : binding.key;
    return [...modifiers, keyDisplay].join(' + ');
  }

  public getAvailableActions(): string[] {
    return Array.from(new Set(Array.from(this.keyBindings.values()).map(binding => binding.action)));
  }

  public updateConfig(config: Partial<KeyboardManagerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.keyBindings) {
      this.initializeKeyBindings();
    }
  }

  public destroy(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown, true);
    this.element.removeEventListener('keyup', this.handleKeyUp, true);
    
    this.keyBindings.clear();
    this.actionCallbacks.clear();
  }

  public isEnabled(): boolean {
    return this.keyBindings.size > 0;
  }

  public disable(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown, true);
    this.element.removeEventListener('keyup', this.handleKeyUp, true);
  }

  public enable(): void {
    this.element.addEventListener('keydown', this.handleKeyDown, true);
    this.element.addEventListener('keyup', this.handleKeyUp, true);
  }
}