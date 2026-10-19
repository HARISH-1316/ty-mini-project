-- =========================================================
-- Migration 004: Question Bank Publishing & Lab Assessment Allocation Modes
-- =========================================================
-- All changes are safe and additive.
-- =========================================================

-- 1. Extend lab_coding_questions with status and is_published
ALTER TABLE lab_coding_questions
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_lab_questions_status ON lab_coding_questions(status);
CREATE INDEX IF NOT EXISTS idx_lab_questions_published ON lab_coding_questions(is_published);

-- Synchronize status with is_archived if already archived
UPDATE lab_coding_questions
SET status = 'archived', is_published = FALSE
WHERE is_archived = TRUE;

-- 2. Extend lab_assessment with allocation_mode
ALTER TABLE lab_assessment
  ADD COLUMN IF NOT EXISTS allocation_mode VARCHAR(30) NOT NULL DEFAULT 'random'
    CHECK (allocation_mode IN ('specific', 'random', 'hybrid'));

-- 3. Extend la_student_allocations with is_manual flag
ALTER TABLE la_student_allocations
  ADD COLUMN IF NOT EXISTS is_manual BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Create la_selected_questions for Mode A (specific question selection)
CREATE TABLE IF NOT EXISTS la_selected_questions (
  id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  lab_question_id INT NOT NULL REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
  question_order INT NOT NULL DEFAULT 1,
  UNIQUE(lab_id, lab_question_id)
);

CREATE INDEX IF NOT EXISTS idx_la_sel_q_lab ON la_selected_questions(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_q_question ON la_selected_questions(lab_question_id);

-- 5. Ensure all 17 DSA topics exist in topics table
INSERT INTO topics (title, description)
SELECT 'Introduction to Data Structures and Algorithms', 'Foundational concepts of data structures, abstract data types, memory representations, and fundamental algorithms.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Introduction to Data Structures and Algorithms');

INSERT INTO topics (title, description)
SELECT 'Complexity Analysis', 'Asymptotic notations (Big O, Omega, Theta), time complexity, space complexity, and recurrence relation analysis.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Complexity Analysis');

INSERT INTO topics (title, description)
SELECT 'Arrays', 'Linear contiguous memory data structures, traversal, two-pointer techniques, prefix sums, and sliding window algorithms.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Arrays');

INSERT INTO topics (title, description)
SELECT 'Strings', 'Character sequences, string manipulation, pattern matching, palindrome validation, and frequency hashing.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Strings');

INSERT INTO topics (title, description)
SELECT 'Linked Lists', 'Singly linked lists, doubly linked lists, circular lists, pointer manipulation, reversal, and cycle detection.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Linked Lists');

INSERT INTO topics (title, description)
SELECT 'Stacks', 'Last-In First-Out (LIFO) abstract data type, stack implementations, parentheses validation, and monotonic stacks.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Stacks');

INSERT INTO topics (title, description)
SELECT 'Queues', 'First-In First-Out (FIFO) structures, circular queues, deques, priority queues, and sliding window buffers.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Queues');

INSERT INTO topics (title, description)
SELECT 'Recursion', 'Recursive function calls, base cases, call stacks, divide-and-conquer principles, and backtracking.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Recursion');

INSERT INTO topics (title, description)
SELECT 'Searching Algorithms', 'Linear search, binary search on sorted collections, search space optimization, and ternary search.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Searching Algorithms');

INSERT INTO topics (title, description)
SELECT 'Sorting Algorithms', 'Comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap sort) and non-comparison sorting.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Sorting Algorithms');

INSERT INTO topics (title, description)
SELECT 'Hashing', 'Hash tables, hash functions, collision resolution (chaining, open addressing), and frequency counting.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Hashing');

INSERT INTO topics (title, description)
SELECT 'Trees', 'Hierarchical data structures, binary trees, tree traversals (inorder, preorder, postorder, level-order), height, and diameter.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Trees');

INSERT INTO topics (title, description)
SELECT 'Binary Search Trees', 'Ordered binary trees, BST search, insertion, deletion, range queries, and BST property validation.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Binary Search Trees');

INSERT INTO topics (title, description)
SELECT 'Heaps and Priority Queues', 'Min-heaps, max-heaps, heapify operations, priority queues, and Top-K elements optimization.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Heaps and Priority Queues');

INSERT INTO topics (title, description)
SELECT 'Graphs', 'Vertices and edges representations (adjacency matrix, list), BFS, DFS, cycle detection, connected components, and shortest paths.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Graphs');

INSERT INTO topics (title, description)
SELECT 'Greedy Algorithms', 'Greedy choice property, interval scheduling, fractional knapsack, activity selection, and Huffman encoding.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Greedy Algorithms');

INSERT INTO topics (title, description)
SELECT 'Dynamic Programming', 'Overlapping subproblems, optimal substructure, memoization, tabulation, and standard DP optimizations.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Dynamic Programming');
