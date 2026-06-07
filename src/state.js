class BugflowState {
    constructor() {
        this.state = {
            z_index_base: 1,
            endpoint: 'https://app.bugflow.io/api/v1',
            key: '',
            widget_style: 'circle',
            alignment: 'lower-right',
            icon_text_color: '#ffffff',
            widget_color: '#4F46E5',
            widget_text: 'Feedback',
            icon: 'message-circle-right',
            modal_title: 'Submit Feedback',
            secondary_text: 'How can we make things better?',
            feedback_prompt: 'What should we improve?',
            button_color: '#4F46E5',
            theme: 'auto',
            show_additional_comments: true,
            reporting_state: 'not-active',
            show_widget: true,
            active_tool: 'location',
            selected_color: '#D5000D',
            previous_tool: 'location',
            drawings: [],
            tools: [],
            capturing_screenshot: false,
            metadata: {}
        };

        this.listeners = new Set();
    }
  
    // Get current settings
    get(key) {
        return this.state[key];
    }
  
    // Get all settings
    getAll() {
        return { ...this.state };
    }
  
    // Update settings
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Notify listeners of change
        this.notify(key, value, oldValue);
    }
  
    // Update multiple settings at once
    update(newSettings) {
        Object.entries(newSettings).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
  
    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }
  
    // Notify all listeners
    notify(key, newValue, oldValue) {
        this.listeners.forEach(callback => {
            callback(key, newValue, oldValue);
        });
    }
  
    // Reset to defaults
    reset() {
        this.state = {
            z_index_base: 1,
            endpoint: 'https://app.bugflow.io/api/v1',
            key: '',
            widget_style: 'circle',
            alignment: 'lower-right',
            icon_text_color: '#ffffff',
            widget_color: '#4F46E5',
            widget_text: 'Feedback',
            icon: 'message-circle-right',
            modal_title: 'Submit Feedback',
            secondary_text: 'How can we make things better?',
            feedback_prompt: 'What should we improve?',
            button_color: '#4F46E5',
            theme: 'auto',
            show_additional_comments: true,
            reporting_state: 'not-active',
            show_widget: true,
            active_tool: 'location',
            selected_color: '#4F46E5',
            previous_tool: 'location',
            drawings: [],
            tools: [],
            capturing_screenshot: false,
            metadata: {}
        };
        this.notify('*', this.state, {});
    }
}
  
// Export singleton instance
export const state = new BugflowState();