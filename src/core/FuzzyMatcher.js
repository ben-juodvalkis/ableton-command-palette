/**
 * FuzzyMatcher - Search Algorithm
 *
 * Implements fuzzy string matching for command search.
 * Provides scoring based on consecutive matches, word boundaries, and position.
 */

class FuzzyMatcher {
    constructor() {
        // Scoring weights
        this.weights = {
            consecutiveBonus: 5,   // Bonus for consecutive character matches
            wordBoundaryBonus: 3,  // Bonus for matching at word start
            earlyPositionBonus: 2, // Bonus for matches in first 5 chars
            keywordBonus: 2        // Bonus for matching keywords
        };
    }

    /**
     * Calculate fuzzy match score between query and target
     * @param {string} query - Search query
     * @param {string} target - Target string to match against
     * @returns {number|null} Score if match, null if no match
     */
    match(query, target) {
        if (!query || !target) return null;

        query = query.toLowerCase();
        target = target.toLowerCase();

        let score = 0;
        let queryIndex = 0;
        let lastMatchIndex = -1;

        for (let i = 0; i < target.length && queryIndex < query.length; i++) {
            if (target[i] === query[queryIndex]) {
                score += 1; // Base score for match

                // Consecutive match bonus
                if (i === lastMatchIndex + 1) {
                    score += this.weights.consecutiveBonus;
                }

                // Word boundary bonus (start of word)
                if (i === 0 || target[i - 1] === ' ' || target[i - 1] === '_' || target[i - 1] === '-') {
                    score += this.weights.wordBoundaryBonus;
                }

                // Early position bonus
                if (i < 5) {
                    score += this.weights.earlyPositionBonus;
                }

                lastMatchIndex = i;
                queryIndex++;
            }
        }

        // Return score only if all query characters matched
        return queryIndex === query.length ? score : null;
    }

    /**
     * Search commands and return sorted results
     * @param {string} query - Search query
     * @param {Array} commands - Array of command objects
     * @returns {Array} Sorted array of {command, score}
     */
    search(query, commands) {
        if (!query || query.trim() === "") {
            return commands.map(cmd => ({ command: cmd, score: 0 }));
        }

        const results = [];

        for (const cmd of commands) {
            // Build searchable text from title, keywords, and description
            const searchText = this.buildSearchText(cmd);

            // Try matching against title first (higher weight)
            let titleScore = this.match(query, cmd.title);
            if (titleScore !== null) {
                titleScore *= 2; // Title matches are worth more
            }

            // Try matching against full search text
            const textScore = this.match(query, searchText);

            // Try matching against keywords
            let keywordScore = null;
            if (cmd.keywords && Array.isArray(cmd.keywords)) {
                for (const keyword of cmd.keywords) {
                    const kScore = this.match(query, keyword);
                    if (kScore !== null) {
                        keywordScore = (keywordScore || 0) + kScore + this.weights.keywordBonus;
                    }
                }
            }

            // Use best score
            const bestScore = Math.max(
                titleScore || 0,
                textScore || 0,
                keywordScore || 0
            );

            if (bestScore > 0) {
                results.push({ command: cmd, score: bestScore });
            }
        }

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        return results;
    }

    /**
     * Build searchable text from command
     * @param {Object} cmd - Command object
     * @returns {string} Combined searchable text
     */
    buildSearchText(cmd) {
        const parts = [cmd.title];

        if (cmd.keywords && Array.isArray(cmd.keywords)) {
            parts.push(...cmd.keywords);
        }

        if (cmd.description) {
            parts.push(cmd.description);
        }

        if (cmd.category) {
            parts.push(cmd.category);
        }

        return parts.join(' ');
    }

    /**
     * Highlight matched characters in a string
     * @param {string} query - Search query
     * @param {string} text - Text to highlight
     * @returns {Array} Array of {text, matched} segments
     */
    highlight(query, text) {
        if (!query) {
            return [{ text, matched: false }];
        }

        const segments = [];
        let queryIndex = 0;
        let currentSegment = '';
        let inMatch = false;

        query = query.toLowerCase();
        const lowerText = text.toLowerCase();

        for (let i = 0; i < text.length; i++) {
            const isMatch = queryIndex < query.length && lowerText[i] === query[queryIndex];

            if (isMatch !== inMatch) {
                if (currentSegment) {
                    segments.push({ text: currentSegment, matched: inMatch });
                }
                currentSegment = '';
                inMatch = isMatch;
            }

            currentSegment += text[i];

            if (isMatch) {
                queryIndex++;
            }
        }

        if (currentSegment) {
            segments.push({ text: currentSegment, matched: inMatch });
        }

        return segments;
    }
}

module.exports = { FuzzyMatcher: FuzzyMatcher };
