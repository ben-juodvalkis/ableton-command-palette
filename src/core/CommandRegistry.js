/**
 * CommandRegistry - Command Management
 *
 * Handles loading, storing, and retrieving commands.
 * Commands are organized by category and can be queried by ID or category.
 */

class CommandRegistry {
    constructor() {
        this.commands = new Map();
        this.categories = new Map();
    }

    /**
     * Load commands from a JSON array
     * @param {string} category - Category name
     * @param {Array} commandList - Array of command objects
     */
    loadFromJSON(category, commandList) {
        if (!Array.isArray(commandList)) {
            throw new Error(`Expected array for category ${category}`);
        }

        for (const cmd of commandList) {
            this.register(cmd);
        }

        post(`Loaded ${commandList.length} commands in category: ${category}\n`);
    }

    /**
     * Register a single command
     * @param {Object} command - Command object
     */
    register(command) {
        // Validate required fields
        if (!command.id || !command.title || !command.action) {
            throw new Error(`Invalid command: missing required fields`);
        }

        // Store command
        this.commands.set(command.id, command);

        // Index by category
        const category = command.category || "Uncategorized";
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        this.categories.get(category).push(command);
    }

    /**
     * Get all registered commands
     * @returns {Array} All commands
     */
    getAll() {
        return Array.from(this.commands.values());
    }

    /**
     * Get commands by category
     * @param {string} category - Category name
     * @returns {Array} Commands in category
     */
    getByCategory(category) {
        return this.categories.get(category) || [];
    }

    /**
     * Get a command by ID
     * @param {string} id - Command ID
     * @returns {Object|null} Command or null
     */
    getById(id) {
        return this.commands.get(id) || null;
    }

    /**
     * Get all category names
     * @returns {Array} Category names
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * Get total command count
     * @returns {number} Total commands
     */
    count() {
        return this.commands.size;
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands.clear();
        this.categories.clear();
    }
}

module.exports = { CommandRegistry: CommandRegistry };
