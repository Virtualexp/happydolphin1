// core/eventBus.js
window.EventBus = {
  events: {},

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    const listeners = this.events[event];
    if (!listeners || !listeners.length) return;

    listeners.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`EventBus listener error for "${event}":`, err);
      }
    });
  }
};
