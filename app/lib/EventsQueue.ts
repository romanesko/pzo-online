class BSTNode {
  timestamp: number;
  data: any;
  left: BSTNode | null = null;
  right: BSTNode | null = null;


  constructor(timestamp: number, data: any) {
    this.timestamp = timestamp;
    this.data = data;
  }
}

class BST {
  private root: BSTNode | null = null;
  private lastTs: number | null = null;
  // Insert a new node into the BST

  insert(timestamp: number, data: any): void {
    this.lastTs = timestamp
    const newNode = new BSTNode(timestamp, data);
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertRec(this.root, newNode);
    }
  }

  // Recursive insert helper function
  private insertRec(root: BSTNode, newNode: BSTNode): void {
    if (newNode.timestamp < root.timestamp) {
      if (root.left === null) {
        root.left = newNode;
      } else {
        this.insertRec(root.left, newNode);
      }
    } else {
      if (root.right === null) {
        root.right = newNode;
      } else {
        this.insertRec(root.right, newNode);
      }
    }
  }

  // Retrieve all entries with timestamps greater than the specified value
  getEntriesAfter(timestamp: number): any[] {
    const result: any[] = [];
    this.getEntriesAfterRec(this.root, timestamp, result);
    return result;
  }

  // Recursive helper function to collect entries
  private getEntriesAfterRec(
      node: BSTNode | null,
      timestamp: number,
      result: any[]
  ): void {
    if (node === null) {
      return;
    }
    if (node.timestamp > timestamp) {
      result.push({ts:node.timestamp, data:node.data});
      this.getEntriesAfterRec(node.left, timestamp, result);
      this.getEntriesAfterRec(node.right, timestamp, result);
    } else {
      this.getEntriesAfterRec(node.right, timestamp, result);
    }
  }

  // Remove all entries with timestamps earlier than the specified value
  removeEntriesBefore(timestamp: number): void {
    this.root = this.removeEntriesBeforeRec(this.root, timestamp);
  }

  // Recursive helper function to remove nodes
  private removeEntriesBeforeRec(
      node: BSTNode | null,
      timestamp: number
  ): BSTNode | null {
    if (node === null) {
      return null;
    }

    // If the current node's timestamp is less than the specified timestamp,
    // remove this node and all its descendants
    if (node.timestamp < timestamp) {
      return this.removeEntriesBeforeRec(node.right, timestamp);
    }

    // Otherwise, recursively process the left and right subtrees
    node.left = this.removeEntriesBeforeRec(node.left, timestamp);
    node.right = this.removeEntriesBeforeRec(node.right, timestamp);
    return node;
  }

  getLatestEntry(): any | null {
    if (this.root === null) {
      return null; // Tree is empty
    }
    let current = this.root;
    while (current.right !== null) {
      current = current.right;
    }
    return {ts:current.timestamp, data:current.data}
  }

  getLastTs() {
    return this.lastTs
  }
}

// Example usage
export const queue = new BST();


