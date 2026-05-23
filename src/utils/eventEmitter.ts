import { EventEmitter } from 'events';

// Create a typed, global event emitter instance
class DomainEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow large volume event listeners
    this.setMaxListeners(100);
  }
}

export const eventEmitter = new DomainEventEmitter();
