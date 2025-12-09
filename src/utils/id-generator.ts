import { randomBytes } from "crypto";

/**
 * Generates unique task IDs with consistent format.
 * Uses timestamp + random hex for uniqueness.
 */
export class TaskIDGenerator {
  /**
   * Generates a unique task ID with format: prefix-timestamp-random
   *
   * @param prefix - Prefix for the ID (default: "task")
   * @returns Unique task ID
   *
   * @example
   * ```typescript
   * const id = TaskIDGenerator.generate();
   * // Returns: "task-1733750400000-a1b2c3d4"
   *
   * const customId = TaskIDGenerator.generate("subtask");
   * // Returns: "subtask-1733750400000-e5f6g7h8"
   * ```
   */
  static generate(prefix: string = "task"): string {
    const timestamp = Date.now();
    const random = randomBytes(4).toString("hex");
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Validates a task ID format.
   * Accepts three formats:
   * - Timestamped: "task-1234567890-abcd1234"
   * - Hierarchical: "1.2.3"
   * - Numeric: "123"
   *
   * @param id - Task ID to validate
   * @returns true if ID format is valid
   *
   * @example
   * ```typescript
   * TaskIDGenerator.validate("task-1234-abcd"); // true
   * TaskIDGenerator.validate("1.2.3"); // true
   * TaskIDGenerator.validate("123"); // true
   * TaskIDGenerator.validate("invalid!"); // false
   * ```
   */
  static validate(id: string): boolean {
    if (!id || typeof id !== "string") {
      return false;
    }

    // Format 1: Timestamped (task-timestamp-random)
    const timestampedPattern = /^[a-z]+-\d+-[a-f0-9]{8}$/;
    if (timestampedPattern.test(id)) {
      return true;
    }

    // Format 2: Hierarchical (1.2.3)
    const hierarchicalPattern = /^[\d.]+$/;
    if (hierarchicalPattern.test(id)) {
      return true;
    }

    // Format 3: Numeric (123)
    const numericPattern = /^\d+$/;
    if (numericPattern.test(id)) {
      return true;
    }

    return false;
  }

  /**
   * Checks if an ID is unique within a set of existing IDs.
   *
   * @param id - ID to check
   * @param existingIds - Set of existing IDs
   * @returns true if ID is unique
   */
  static isUnique(id: string, existingIds: Set<string>): boolean {
    return !existingIds.has(id);
  }

  /**
   * Generates a unique ID that doesn't exist in the provided set.
   * Retries up to maxAttempts times if collisions occur.
   *
   * @param existingIds - Set of existing IDs to avoid
   * @param prefix - Prefix for the ID
   * @param maxAttempts - Maximum number of generation attempts
   * @returns Unique task ID
   * @throws Error if unable to generate unique ID after maxAttempts
   */
  static generateUnique(
    existingIds: Set<string>,
    prefix: string = "task",
    maxAttempts: number = 10
  ): string {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const id = this.generate(prefix);
      if (this.isUnique(id, existingIds)) {
        return id;
      }
    }

    throw new Error(
      `Failed to generate unique ID after ${maxAttempts} attempts`
    );
  }

  /**
   * Generates a hierarchical child ID from a parent ID.
   * If parent is "1.2", generates "1.2.1", "1.2.2", etc.
   *
   * @param parentId - Parent task ID
   * @param childIndex - Index of the child (1-based)
   * @returns Child task ID
   *
   * @example
   * ```typescript
   * TaskIDGenerator.generateChildId("1", 1); // "1.1"
   * TaskIDGenerator.generateChildId("1.2", 3); // "1.2.3"
   * ```
   */
  static generateChildId(parentId: string, childIndex: number): string {
    return `${parentId}.${childIndex}`;
  }

  /**
   * Parses a hierarchical ID to extract parent ID and child index.
   *
   * @param id - Hierarchical task ID
   * @returns Object with parentId and childIndex, or null if not hierarchical
   *
   * @example
   * ```typescript
   * TaskIDGenerator.parseHierarchicalId("1.2.3");
   * // Returns: { parentId: "1.2", childIndex: 3 }
   * ```
   */
  static parseHierarchicalId(
    id: string
  ): { parentId: string; childIndex: number } | null {
    const parts = id.split(".");
    if (parts.length < 2) {
      return null;
    }

    const childIndex = parseInt(parts[parts.length - 1], 10);
    if (isNaN(childIndex)) {
      return null;
    }

    const parentId = parts.slice(0, -1).join(".");
    return { parentId, childIndex };
  }
}
