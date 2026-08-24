-- =========================================================
-- WCE VIRTUAL LAB — COMPLETE QUIZ SEED SCRIPT
-- =========================================================
-- Seeds exactly 10 questions for:
-- 1. Prerequisite Quiz (DSA)
-- 2. All 17 Subtopic Quizzes (DSA)
-- 3. Final Comprehensive Quiz (DSA)
-- All quizzes have time_limit = 15 minutes and dynamic total_marks.
-- Difficulty distribution: Q1-4 (Easy, 1 mark), Q5-8 (Medium, 1 mark), Q9-10 (Hard, 2 marks).
-- =========================================================

BEGIN;

-- Ensure schema updates are present
ALTER TABLE prerequisite_quiz ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 15;
ALTER TABLE subtopic_content ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 15;
ALTER TABLE final_quiz ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 15;

CREATE TABLE IF NOT EXISTS prerequisite_quiz_questions (
    pq_question_id SERIAL PRIMARY KEY,
    prereq_quiz_id INT NOT NULL REFERENCES prerequisite_quiz(prereq_quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL,
    marks INT DEFAULT 1,
    order_index INT
);

DO $$ BEGIN
    CREATE TYPE quiz_type_enum AS ENUM ('prerequisite', 'subtopic', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    quiz_type quiz_type_enum NOT NULL,
    quiz_ref_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    passed BOOLEAN,
    answers JSONB
);

DO $seed_all_quizzes_block$
DECLARE
    v_topic_id INT;
    v_prereq_id INT;
    v_prereq_quiz_id INT;
    v_final_quiz_id INT;
    v_subtopic_id INT;
    v_content_id INT;
BEGIN
    SELECT topic_id INTO v_topic_id FROM topics WHERE title = 'Data Structures and Algorithms' LIMIT 1;

    IF v_topic_id IS NOT NULL THEN
        -- =========================================================
        -- 1. PREREQUISITE QUIZ (10 Questions, 15 Mins)
        -- =========================================================
        SELECT prereq_id INTO v_prereq_id FROM prerequisite WHERE topic_id = v_topic_id LIMIT 1;
        IF v_prereq_id IS NULL THEN
            INSERT INTO prerequisite (topic_id, description, content, order_index)
            VALUES (v_topic_id, 'Prerequisites for Data Structures and Algorithms', 'Basic C/C++ programming syntax, memory addresses, basic mathematical logic, and recursion concepts.', 1)
            RETURNING prereq_id INTO v_prereq_id;
        END IF;

        SELECT prereq_quiz_id INTO v_prereq_quiz_id FROM prerequisite_quiz WHERE prereq_id = v_prereq_id LIMIT 1;
        IF v_prereq_quiz_id IS NULL THEN
            INSERT INTO prerequisite_quiz (prereq_id, title, total_marks, passing_criteria, time_limit)
            VALUES (v_prereq_id, 'DSA Prerequisite Assessment', 12, 50, 15)
            RETURNING prereq_quiz_id INTO v_prereq_quiz_id;
        ELSE
            UPDATE prerequisite_quiz SET time_limit = 15 WHERE prereq_quiz_id = v_prereq_quiz_id;
        END IF;

        -- Clean and seed exactly 10 questions
        DELETE FROM prerequisite_quiz_questions WHERE prereq_quiz_id = v_prereq_quiz_id;

        INSERT INTO prerequisite_quiz_questions (prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
        (v_prereq_quiz_id, 'What is the time complexity to access an element in a contiguous array by its index?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'A', 1, 1),
        (v_prereq_quiz_id, 'Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?', 'Queue', 'Stack', 'Array', 'Binary Tree', 'B', 1, 2),
        (v_prereq_quiz_id, 'Which data structure operates on the First-In, First-Out (FIFO) principle?', 'Stack', 'Queue', 'Priority Queue', 'Graph', 'B', 1, 3),
        (v_prereq_quiz_id, 'Which asymptotic notation represents the strict upper bound of algorithm execution time?', 'Big-Omega (Ω)', 'Big-Theta (Θ)', 'Big-O (O)', 'Little-o (o)', 'C', 1, 4),
        (v_prereq_quiz_id, 'What happens when a recursive function lacks a valid base case?', 'It terminates in O(1) time', 'It causes stack overflow runtime error', 'It returns 0 automatically', 'It compiles with a warning', 'B', 1, 5),
        (v_prereq_quiz_id, 'In C/C++, which operator is used to obtain the physical memory address of a variable?', '*', '&', '->', '.', 'B', 1, 6),
        (v_prereq_quiz_id, 'What is the space complexity of allocating an array of size N in memory?', 'O(1)', 'O(log N)', 'O(N)', 'O(N^2)', 'C', 1, 7),
        (v_prereq_quiz_id, 'Which condition is mandatory for applying Binary Search directly on an array?', 'The array must be dynamically linked', 'The array must be sorted', 'The array must contain only positive numbers', 'The array size must be a power of 2', 'B', 1, 8),
        (v_prereq_quiz_id, 'What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?', 'ADT defines operations without implementation, while Data Structure is the concrete implementation', 'Data Structure defines operations, ADT is hardware-specific', 'There is no difference', 'ADT is only used for databases', 'A', 2, 9),
        (v_prereq_quiz_id, 'Which complexity class indicates the slowest growth rate as input size N increases towards infinity?', 'O(N!)', 'O(N^2)', 'O(N log N)', 'O(1)', 'D', 2, 10);

        UPDATE prerequisite_quiz
        SET total_marks = (SELECT SUM(marks) FROM prerequisite_quiz_questions WHERE prereq_quiz_id = v_prereq_quiz_id)
        WHERE prereq_quiz_id = v_prereq_quiz_id;

        -- =========================================================
        -- 2. FINAL TOPIC QUIZ (10 Questions, 15 Mins)
        -- =========================================================
        SELECT final_quiz_id INTO v_final_quiz_id FROM final_quiz WHERE topic_id = v_topic_id LIMIT 1;
        IF v_final_quiz_id IS NULL THEN
            INSERT INTO final_quiz (topic_id, title, total_marks, time_limit)
            VALUES (v_topic_id, 'Data Structures and Algorithms — Final Comprehensive Quiz', 12, 15)
            RETURNING final_quiz_id INTO v_final_quiz_id;
        ELSE
            UPDATE final_quiz SET time_limit = 15 WHERE final_quiz_id = v_final_quiz_id;
        END IF;

        DELETE FROM final_quiz_questions WHERE final_quiz_id = v_final_quiz_id;

        INSERT INTO final_quiz_questions (final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
        (v_final_quiz_id, 'What is the worst-case time complexity of Quick Sort with standard Lomuto partition?', 'O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)', 'C', 1, 1),
        (v_final_quiz_id, 'Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B', 1, 2),
        (v_final_quiz_id, 'Which data structure is utilized in Breadth-First Search (BFS) graph traversal?', 'Stack', 'Queue', 'Min-Heap', 'Disjoint Set', 'B', 1, 3),
        (v_final_quiz_id, 'What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'B', 1, 4),
        (v_final_quiz_id, 'In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?', 'Stack', 'Priority Queue (Min-Heap)', 'Circular Queue', 'Hash Set', 'B', 1, 5),
        (v_final_quiz_id, 'What is the recurrence relation for Merge Sort dividing input arrays in half at each step?', 'T(n) = T(n-1) + O(1)', 'T(n) = 2T(n/2) + O(n)', 'T(n) = T(n/2) + O(1)', 'T(n) = 2T(n-1) + O(1)', 'B', 1, 6),
        (v_final_quiz_id, 'Which collision resolution technique stores colliding elements in linked lists outside the hash table array?', 'Linear Probing', 'Quadratic Probing', 'Separate Chaining', 'Double Hashing', 'C', 1, 7),
        (v_final_quiz_id, 'What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?', '2^h', '2^(h+1) - 1', '2*h', 'h^2', 'B', 1, 8),
        (v_final_quiz_id, 'Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?', 'Greedy Approach', 'Divide and Conquer', 'Dynamic Programming', 'Brute Force Search', 'C', 2, 9),
        (v_final_quiz_id, 'What is the auxiliary space complexity of standard Merge Sort on an array of size n?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'C', 2, 10);

        UPDATE final_quiz
        SET total_marks = (SELECT SUM(marks) FROM final_quiz_questions WHERE final_quiz_id = v_final_quiz_id)
        WHERE final_quiz_id = v_final_quiz_id;

        -- =========================================================
        -- 3. SUBTOPIC QUIZZES (10 Questions for EACH Subtopic)
        -- =========================================================

        -- 1. Introduction to Data Structures and Algorithms
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Introduction to Data Structures and Algorithms' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'Which of the following is categorized as a non-linear data structure?', 'Array', 'Linked List', 'Tree', 'Stack', 'C', 1, 1),
            (v_content_id, 'A data structure whose size is allocated at compile-time and cannot change is called:', 'Dynamic data structure', 'Static data structure', 'Homogeneous data structure', 'Non-linear data structure', 'B', 1, 2),
            (v_content_id, 'Which essential property of an algorithm requires it to terminate after a finite number of steps?', 'Definiteness', 'Finiteness', 'Effectiveness', 'Generality', 'B', 1, 3),
            (v_content_id, 'Accessing every element in a data structure exactly once is known as:', 'Sorting', 'Merging', 'Traversal', 'Insertion', 'C', 1, 4),
            (v_content_id, 'Which of the following is an example of an Abstract Data Type (ADT)?', 'Integer in RAM', 'Stack ADT', 'CPU Register', 'Hard Disk Sector', 'B', 1, 5),
            (v_content_id, 'Combining elements of two sorted data structures into a single structure is called:', 'Searching', 'Merging', 'Partitioning', 'Filtering', 'B', 1, 6),
            (v_content_id, 'In memory allocation, dynamic data structures are primarily allocated in which memory segment?', 'Call Stack', 'Heap', 'CPU Cache', 'ROM', 'B', 1, 7),
            (v_content_id, 'Which of the following represents homogeneous elements arranged sequentially?', 'Graph', 'Array', 'Tree', 'Hash Map with arbitrary types', 'B', 1, 8),
            (v_content_id, 'Why are space and time complexity evaluated together when selecting a data structure?', 'They are always identical', 'There is often a trade-off between execution speed and memory usage', 'Hardware only supports one or the other', 'To avoid compiler syntax errors', 'B', 2, 9),
            (v_content_id, 'What is the primary objective of algorithm asymptotic analysis?', 'To measure execution speed in nanoseconds on a specific laptop', 'To determine mathematical growth of resource requirements as input size scales', 'To format source code indentation', 'To convert code to machine language', 'B', 2, 10);
        END IF;

        -- 2. Complexity Analysis
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Complexity Analysis' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'Big-Theta notation (Θ) provides:', 'An upper bound only', 'A lower bound only', 'A tight bound (both upper and lower)', 'An average case heuristic only', 'C', 1, 1),
            (v_content_id, 'What is the time complexity of a loop executing for (int i = 1; i < n; i *= 2)?', 'O(n)', 'O(n^2)', 'O(log n)', 'O(1)', 'C', 1, 2),
            (v_content_id, 'Which complexity class grows fastest as n approaches infinity?', 'O(n^3)', 'O(2^n)', 'O(n log n)', 'O(n!)', 'D', 1, 3),
            (v_content_id, 'Auxiliary space complexity refers to:', 'The space occupied by the input data only', 'The temporary or extra space used by the algorithm excluding input size', 'The size of the source code file in kilobytes', 'The hard drive storage capacity', 'B', 1, 4),
            (v_content_id, 'If f(n) = 3n^2 + 5n + 100, what is the asymptotic Big-O complexity?', 'O(100)', 'O(n)', 'O(n^2)', 'O(n^3)', 'C', 1, 5),
            (v_content_id, 'What is the time complexity of adding two n x n matrices?', 'O(n)', 'O(n^2)', 'O(n^3)', 'O(log n)', 'B', 1, 6),
            (v_content_id, 'Master Theorem is applied to solve recurrence relations of which type?', 'Iterative single loops', 'Divide and conquer recurrences of form T(n) = aT(n/b) + f(n)', 'Linear equations with two variables', 'Non-recursive matrix operations', 'B', 1, 7),
            (v_content_id, 'Which notation represents the best-case time complexity strictly?', 'Big-O (O)', 'Big-Omega (Ω)', 'Big-Theta (Θ)', 'Little-omega (ω)', 'B', 1, 8),
            (v_content_id, 'What is the space complexity of a recursive algorithm with depth n where each call frame takes O(1) space?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'C', 2, 9),
            (v_content_id, 'An algorithm executes in constant time regardless of input size n. Its complexity is:', 'O(0)', 'O(1)', 'O(n)', 'O(log 1)', 'B', 2, 10);
        END IF;

        -- 3. Arrays
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Arrays' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'Given base address B, element size w, what is the address of A[i] in a 0-indexed 1D array?', 'B + (i - 1) * w', 'B + i * w', 'B + i / w', 'B * i + w', 'B', 1, 1),
            (v_content_id, 'What is the time complexity of inserting an element at index 0 of an array of size n?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'C', 1, 2),
            (v_content_id, 'In Row-Major order for a 2D array A[R][C] with base address B, the address of A[i][j] is:', 'B + (i * C + j) * w', 'B + (j * R + i) * w', 'B + (i + j) * w', 'B + (i * R + j) * w', 'A', 1, 3),
            (v_content_id, 'Why does array access by index take O(1) constant time?', 'Elements are stored in random disk locations', 'Hardware uses mathematical contiguous address calculation directly', 'The compiler uses a binary search lookup tree', 'Array indices are hashed at runtime', 'B', 1, 4),
            (v_content_id, 'What is the disadvantage of static arrays compared to dynamic arrays?', 'Static arrays take O(n) access time', 'Static arrays have fixed capacity determined at creation', 'Static arrays cannot store integer types', 'Static arrays do not support iteration', 'B', 1, 5),
            (v_content_id, 'What is the time complexity of the Two-Pointer technique used to reverse an array in-place?', 'O(n^2)', 'O(n log n)', 'O(n)', 'O(1)', 'C', 1, 6),
            (v_content_id, 'What error occurs if an application attempts to write to index 10 in an array of size 5?', 'Stack underflow', 'Array index out of bounds / Buffer overflow', 'Type mismatch exception', 'Memory fragmentation', 'B', 1, 7),
            (v_content_id, 'What is the amortized time complexity of inserting an element at the end of a dynamic array (std::vector)?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'A', 1, 8),
            (v_content_id, 'Why do CPU caches perform faster during array iteration compared to linked lists?', 'Arrays use more CPU threads', 'High spatial locality due to contiguous memory storage', 'Linked list nodes are cached automatically in L1 cache', 'Arrays contain no binary data', 'B', 2, 9),
            (v_content_id, 'In the Sliding Window technique on an array of size n, what is the typical overall time complexity?', 'O(n^2)', 'O(n)', 'O(2^n)', 'O(n!)', 'B', 2, 10);
        END IF;

        -- 4. Strings
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Strings' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'In C, what special character terminates a string literal in memory?', '\n', '\0', '\t', 'EOF', 'B', 1, 1),
            (v_content_id, 'What is the time complexity of computing the length of a null-terminated string of n characters?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'B', 1, 2),
            (v_content_id, 'Which string matching algorithm uses the Longest Prefix Suffix (LPS) array?', 'Rabin-Karp Algorithm', 'Knuth-Morris-Pratt (KMP) Algorithm', 'Boyer-Moore Algorithm', 'Naive String Matching', 'B', 1, 3),
            (v_content_id, 'What is the best-case time complexity of the KMP algorithm for searching a pattern of length m in text of length n?', 'O(n + m)', 'O(n * m)', 'O(n^2)', 'O(log n)', 'A', 1, 4),
            (v_content_id, 'Which algorithm uses a rolling hash to achieve linear time string matching on average?', 'KMP Algorithm', 'Rabin-Karp Algorithm', 'Z-Algorithm', 'Aho-Corasick', 'B', 1, 5),
            (v_content_id, 'What is a Palindrome string?', 'A string with only vowels', 'A string that reads the same forwards and backwards', 'A string with alternating upper and lower case', 'A string containing all unique characters', 'B', 1, 6),
            (v_content_id, 'Two strings are called Anagrams if they:', 'Have the same length and exact same characters with identical frequencies', 'Have the same first and last characters', 'Contain only uppercase letters', 'Are substrings of each other', 'A', 1, 7),
            (v_content_id, 'What is the time complexity to check if a string of length n is a palindrome using two pointers?', 'O(n)', 'O(n^2)', 'O(log n)', 'O(1)', 'A', 1, 8),
            (v_content_id, 'Why does repeated string concatenation with += in a loop cause O(n^2) performance in immutable string languages?', 'Strings are stored in ROM', 'Every concatenation allocates a new string object and copies previous characters', 'String indexing is disabled in loops', 'Immutable strings use tree traversal', 'B', 2, 9),
            (v_content_id, 'What data structure is optimal for autocomplete and prefix search dictionaries?', 'Binary Search Tree', 'Trie (Prefix Tree)', 'Stack', 'Circular Queue', 'B', 2, 10);
        END IF;

        -- 5. Linked Lists
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Linked Lists' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What does each node in a singly linked list contain?', 'Data and two pointers', 'Data and a single pointer to the next node', 'Two data values and no pointer', 'An array index and a pointer', 'B', 1, 1),
            (v_content_id, 'What is the time complexity to insert a new node at the head of a singly linked list?', 'O(n)', 'O(1)', 'O(log n)', 'O(n^2)', 'B', 1, 2),
            (v_content_id, 'What is the time complexity to access the k-th element in a singly linked list of size n?', 'O(1)', 'O(log n)', 'O(k) / O(n)', 'O(n^2)', 'C', 1, 3),
            (v_content_id, 'Which algorithm detects a cycle in a linked list using slow and fast pointers in O(n) time and O(1) space?', 'Dijkstra Algorithm', 'Floyd Cycle Finding Algorithm (Tortoise and Hare)', 'Kadane Algorithm', 'Kruskal Algorithm', 'B', 1, 4),
            (v_content_id, 'In a circular singly linked list, what does the next pointer of the last node point to?', 'NULL', 'Head node', 'Previous node', 'A random node', 'B', 1, 5),
            (v_content_id, 'What is the memory advantage of singly linked lists over doubly linked lists?', 'Singly linked lists store only one pointer per node instead of two', 'Singly linked lists do not store data', 'Singly linked lists reside in CPU cache only', 'There is no difference in memory', 'A', 1, 6),
            (v_content_id, 'To delete a node given only a pointer to that node in a doubly linked list, the time complexity is:', 'O(n)', 'O(log n)', 'O(1)', 'O(n^2)', 'C', 1, 7),
            (v_content_id, 'What condition indicates an empty singly linked list?', 'head->next == nullptr', 'head == nullptr', 'tail == head', 'head->data == 0', 'B', 1, 8),
            (v_content_id, 'What happens if you delete a node in C++ without calling delete/free on its heap memory pointer?', 'Segmentation fault immediately', 'Memory leak', 'Automatic garbage collection in C++', 'Data corruption in hard drive', 'B', 2, 9),
            (v_content_id, 'Which data structure implementation is ideal for supporting Undo/Redo operations with previous and next navigation?', 'Singly Linked List', 'Doubly Linked List', 'Static Array', 'Circular Queue', 'B', 2, 10);
        END IF;

        -- 6. Stacks
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Stacks' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'Which principle governs the Stack data structure?', 'FIFO (First-In First-Out)', 'LIFO (Last-In First-Out)', 'Random Order', 'Priority Order', 'B', 1, 1),
            (v_content_id, 'What is the time complexity of the push and pop operations on a stack?', 'O(n)', 'O(log n)', 'O(1)', 'O(n^2)', 'C', 1, 2),
            (v_content_id, 'Attempting to pop an element from an empty stack results in:', 'Stack Overflow', 'Stack Underflow', 'Deadlock', 'Memory Leak', 'B', 1, 3),
            (v_content_id, 'Which algorithm uses a stack to convert infix expressions to postfix format?', 'Dijkstra Shunting-Yard Algorithm', 'Prim Algorithm', 'Bellman-Ford Algorithm', 'KMP Algorithm', 'A', 1, 4),
            (v_content_id, 'Evaluating the postfix expression "5 3 + 2 *" yields:', '16', '13', '10', '26', 'A', 1, 5),
            (v_content_id, 'In recursive function execution, what does the CPU runtime use to manage function call frames?', 'Heap Memory', 'Call Stack', 'I/O Queue', 'Hash Table', 'B', 1, 6),
            (v_content_id, 'Which problem is naturally solved using a stack for bracket matching?', 'Balanced Parentheses Verification', 'Minimum Spanning Tree', 'Single Source Shortest Path', 'Linear Search', 'A', 1, 7),
            (v_content_id, 'In an array-based stack of capacity MAX, what condition indicates stack overflow during push?', 'top == 0', 'top == MAX - 1', 'top == -1', 'top == MAX / 2', 'B', 1, 8),
            (v_content_id, 'What does the peek() / top() operation do in a stack?', 'Deletes the top element', 'Returns the top element without removing it', 'Clears all elements', 'Reverses the stack', 'B', 2, 9),
            (v_content_id, 'How can a queue be implemented using stacks with amortized O(1) operations?', 'Using a single stack and an array', 'Using two stacks (inbox and outbox)', 'Stacks cannot implement queues', 'Using stack overflow exception handlers', 'B', 2, 10);
        END IF;

        -- 7. Queues
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Queues' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'In a standard queue, insertions occur at the _____ and deletions occur at the _____.', 'Front, Rear', 'Rear, Front', 'Top, Bottom', 'Front, Front', 'B', 1, 1),
            (v_content_id, 'What is the time complexity of enqueue and dequeue operations in an efficient queue?', 'O(n)', 'O(1)', 'O(log n)', 'O(n^2)', 'B', 1, 2),
            (v_content_id, 'Why is a Circular Queue preferred over a simple linear array-based queue?', 'Circular queue uses half the memory', 'Prevents false overflow by reusing emptied front slots', 'Circular queue automatically sorts elements', 'Linear queues cannot store numbers', 'B', 1, 3),
            (v_content_id, 'In a circular queue of capacity N, what formula advances the rear index on enqueue?', 'rear = rear + 1', 'rear = (rear + 1) % N', 'rear = (rear - 1) % N', 'rear = rear * 2', 'B', 1, 4),
            (v_content_id, 'A Double-Ended Queue (Deque) allows insertions and deletions at:', 'Front end only', 'Rear end only', 'Both Front and Rear ends', 'Middle index only', 'C', 1, 5),
            (v_content_id, 'Which graph traversal algorithm fundamentally relies on a queue?', 'Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Topological Sort using DFS', 'Binary Search', 'B', 1, 6),
            (v_content_id, 'What happens when dequeue() is called on an empty queue?', 'Queue Overflow', 'Queue Underflow', 'Memory segmentation', 'Automatic enqueue of 0', 'B', 1, 7),
            (v_content_id, 'Which OS process scheduling algorithm uses a circular queue to allocate equal time slices?', 'First-Come First-Served (FCFS)', 'Round-Robin Scheduling', 'Shortest Job First (SJF)', 'Priority Preemptive', 'B', 1, 8),
            (v_content_id, 'In a priority queue, elements are dequeued according to:', 'Order of arrival only', 'Assigned priority value', 'Memory address value', 'Random selection', 'B', 2, 9),
            (v_content_id, 'If elements A, B, C are enqueued in order into a FIFO queue, what is the output sequence when dequeued?', 'C, B, A', 'A, B, C', 'B, A, C', 'C, A, B', 'B', 2, 10);
        END IF;

        -- 8. Recursion
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Recursion' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is the base case in a recursive algorithm?', 'The condition that causes the function to call itself again', 'The terminating condition that returns a value without making further recursive calls', 'The initial value passed by the main function', 'The maximum stack depth allowed by OS', 'B', 1, 1),
            (v_content_id, 'What runtime error is triggered when a recursive function enters infinite recursion?', 'Stack Overflow Exception', 'Heap Out of Memory', 'Null Pointer Dereference', 'Divide by Zero', 'A', 1, 2),
            (v_content_id, 'What is Tail Recursion?', 'A recursive call where the function calls itself at the very end with no pending operations', 'A function that calls two subfunctions', 'A recursion that counts down to zero', 'A recursion with no base case', 'A', 1, 3),
            (v_content_id, 'Why is tail call optimization (TCO) beneficial in compilers?', 'It prevents all compiler warnings', 'It reuses the current stack frame instead of allocating a new one, avoiding stack overflow', 'It speeds up disk I/O', 'It converts code to assembly directly', 'B', 1, 4),
            (v_content_id, 'What is the time complexity of the naive recursive Fibonacci function Fib(n) = Fib(n-1) + Fib(n-2)?', 'O(n)', 'O(n log n)', 'O(2^n)', 'O(n^2)', 'C', 1, 5),
            (v_content_id, 'How can naive recursive Fibonacci be optimized to run in O(n) linear time?', 'By adding another recursive branch', 'By using Memoization / Dynamic Programming', 'By increasing CPU clock rate', 'By compiling without optimization flags', 'B', 1, 6),
            (v_content_id, 'In the Tower of Hanoi problem with n disks, how many minimum moves are required?', '2n', 'n^2', '2^n - 1', 'n!', 'C', 1, 7),
            (v_content_id, 'What is the auxiliary space complexity of calculating n! recursively?', 'O(1)', 'O(n) due to recursive call stack frames', 'O(n^2)', 'O(log n)', 'B', 1, 8),
            (v_content_id, 'Which algorithm design technique solves problems by dividing into smaller subproblems, solving recursively, and combining results?', 'Greedy Approach', 'Divide and Conquer', 'Linear Probing', 'Heuristic Hill Climbing', 'B', 2, 9),
            (v_content_id, 'What is the solution to the recurrence relation T(n) = 2T(n/2) + O(n) by Master Theorem?', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)', 'B', 2, 10);
        END IF;

        -- 9. Searching Algorithms
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Searching Algorithms' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is the worst-case time complexity of Linear Search in an array of size n?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'C', 1, 1),
            (v_content_id, 'What is the best-case time complexity of Linear Search?', 'O(1) when target is at index 0', 'O(log n)', 'O(n)', 'O(0)', 'A', 1, 2),
            (v_content_id, 'What is the worst-case time complexity of Binary Search in a sorted array of size n?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'B', 1, 3),
            (v_content_id, 'How many comparisons at most does Binary Search make on a sorted array of 1024 elements?', '10', '11', '512', '1024', 'B', 1, 4),
            (v_content_id, 'Why is mid = low + (high - low) / 2 preferred over mid = (low + high) / 2 in Binary Search?', 'It avoids potential integer overflow bug when low + high exceeds INT_MAX', 'It executes twice as fast', 'It supports floating point arrays', 'It sorts the array automatically', 'A', 1, 5),
            (v_content_id, 'What is the space complexity of iterative Binary Search?', 'O(n)', 'O(log n)', 'O(1)', 'O(n^2)', 'C', 1, 6),
            (v_content_id, 'What is the space complexity of recursive Binary Search on an array of size n?', 'O(1)', 'O(log n) stack space', 'O(n)', 'O(n log n)', 'B', 1, 7),
            (v_content_id, 'Ternary Search divides the search space into how many equal parts at each step?', '2', '3', '4', 'n', 'B', 1, 8),
            (v_content_id, 'What condition must hold to apply Binary Search on an answer/search space for optimization problems?', 'The function must be non-linear', 'The decision space must be monotonic (e.g. TTTTFFFF)', 'The input numbers must be prime', 'The array must contain negative numbers', 'B', 2, 9),
            (v_content_id, 'In an array sorted in descending order, if target < arr[mid], which half should be searched?', 'Left half (low to mid - 1)', 'Right half (mid + 1 to high)', 'Both halves simultaneously', 'Stop searching', 'B', 2, 10);
        END IF;

        -- 10. Sorting Algorithms
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Sorting Algorithms' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What does it mean for a sorting algorithm to be Stable?', 'It uses O(1) auxiliary space', 'It preserves the relative order of duplicate elements with equal keys', 'It never runs in O(n^2) time', 'It uses multithreading', 'B', 1, 1),
            (v_content_id, 'What is the worst-case time complexity of Selection Sort?', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)', 'C', 1, 2),
            (v_content_id, 'What is the best-case time complexity of Bubble Sort when optimized with a swapped boolean flag?', 'O(1)', 'O(n)', 'O(n log n)', 'O(n^2)', 'B', 1, 3),
            (v_content_id, 'Which sorting algorithm inserts elements one by one into an already sorted prefix partition?', 'Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Heap Sort', 'B', 1, 4),
            (v_content_id, 'What is the average and worst-case time complexity of Merge Sort?', 'O(n log n) in both average and worst case', 'O(n^2) worst case', 'O(n) best case and O(n^3) worst case', 'O(log n)', 'A', 1, 5),
            (v_content_id, 'Why is standard Quick Sort not a stable sorting algorithm?', 'It uses recursion', 'Swapping during partition can reorder duplicate elements across the pivot', 'It requires O(n) extra space', 'Pivots are selected randomly', 'B', 1, 6),
            (v_content_id, 'What is the theoretical lower bound on comparisons for any comparison-based sorting algorithm in the worst case?', 'Ω(n)', 'Ω(n log n)', 'Ω(n^2)', 'Ω(log n)', 'B', 1, 7),
            (v_content_id, 'Which sorting algorithm achieves O(n + k) linear time complexity for keys in range 0 to k?', 'Counting Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort', 'A', 1, 8),
            (v_content_id, 'What pivot selection technique mitigates Quick Sort worst-case O(n^2) degradation on sorted inputs?', 'Always picking index 0', 'Median-of-three or Randomized pivot selection', 'Picking the largest element', 'Picking index n - 1', 'B', 2, 9),
            (v_content_id, 'Which sorting algorithm has worst-case O(n log n) time and O(1) auxiliary space?', 'Merge Sort', 'Heap Sort', 'Quick Sort', 'Counting Sort', 'B', 2, 10);
        END IF;

        -- 11. Hashing
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Hashing' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is a Hash Function?', 'A sorting algorithm', 'A mathematical function that converts key data into a fixed-size integer table index', 'A compression tool for images', 'A hardware timer', 'B', 1, 1),
            (v_content_id, 'What is the average time complexity of insertion, deletion, and lookup in a Hash Table?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'A', 1, 2),
            (v_content_id, 'A Hash Collision occurs when:', 'Two identical keys have different values', 'Two distinct keys produce identical hash indices', 'The hash table becomes completely empty', 'The memory runs out of space', 'B', 1, 3),
            (v_content_id, 'In Separate Chaining, how are colliding entries handled?', 'Stored in a linked list attached to the bucket', 'Stored in the next empty array slot', 'The previous entry is overwritten', 'The hash table is resized immediately', 'A', 1, 4),
            (v_content_id, 'What collision resolution technique probes indices linearly using (h(k) + i) mod m?', 'Quadratic Probing', 'Linear Probing', 'Double Hashing', 'Separate Chaining', 'B', 1, 5),
            (v_content_id, 'What is the Load Factor (α) of a hash table with n elements and m buckets?', 'α = m / n', 'α = n / m', 'α = n * m', 'α = n^2 / m', 'B', 1, 6),
            (v_content_id, 'What problem occurs in Linear Probing when long contiguous blocks of occupied slots form?', 'Primary Clustering', 'Secondary Clustering', 'Stack Overflow', 'Deadlock', 'A', 1, 7),
            (v_content_id, 'What is the purpose of dynamic Rehashing when the load factor exceeds a threshold (e.g. 0.75)?', 'To compress the table size', 'To allocate a larger table (usually 2x) and recompute hashes to maintain O(1) efficiency', 'To sort all table keys', 'To convert keys to strings', 'B', 1, 8),
            (v_content_id, 'What is the worst-case time complexity of searching in a hash table when all n keys collide into a single bucket?', 'O(1)', 'O(log n)', 'O(n)', 'O(n^2)', 'C', 2, 9),
            (v_content_id, 'In Double Hashing, the probing formula uses:', 'h(k, i) = (h1(k) + i * h2(k)) mod m', 'h(k, i) = (h1(k) + i^2) mod m', 'h(k, i) = (h1(k) + 1) mod m', 'h(k, i) = h1(k) * h2(k)', 'A', 2, 10);
        END IF;

        -- 12. Trees
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Trees' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is the maximum number of children a node can have in a Binary Tree?', '1', '2', '3', 'Unlimited', 'B', 1, 1),
            (v_content_id, 'A binary tree where every node has either 0 or 2 children is called a:', 'Full Binary Tree', 'Perfect Binary Tree', 'Complete Binary Tree', 'Degenerate Tree', 'A', 1, 2),
            (v_content_id, 'In which tree traversal are nodes visited in order: Left subtree -> Root -> Right subtree?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B', 1, 3),
            (v_content_id, 'What is the height of a tree with a single root node only?', '0 (or 1 depending on convention)', '-1', 'Infinity', 'Undefined', 'A', 1, 4),
            (v_content_id, 'In a binary tree, what is the post-order traversal sequence for visiting nodes?', 'Root -> Left -> Right', 'Left -> Right -> Root', 'Left -> Root -> Right', 'Right -> Root -> Left', 'B', 1, 5),
            (v_content_id, 'Which traversal visits all nodes at depth d before moving to depth d+1?', 'Pre-order', 'Level-order traversal (BFS)', 'Post-order', 'In-order', 'B', 1, 6),
            (v_content_id, 'What is the total number of edges in any valid tree having N vertices?', 'N', 'N - 1', 'N + 1', '2N', 'B', 1, 7),
            (v_content_id, 'A node with zero children in a tree is called a:', 'Internal node', 'Root node', 'Leaf node (or Terminal node)', 'Ancestor node', 'C', 1, 8),
            (v_content_id, 'What is the time complexity of visiting all N nodes in a binary tree traversal?', 'O(log N)', 'O(N)', 'O(N^2)', 'O(1)', 'B', 2, 9),
            (v_content_id, 'What is the maximum number of nodes in a Perfect Binary Tree of height h (root at h=0)?', '2^h', '2^(h+1) - 1', '2*h', 'h^2', 'B', 2, 10);
        END IF;

        -- 13. Binary Search Trees
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Binary Search Trees' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'In a Binary Search Tree (BST), what is true for every node X?', 'Left subtree keys < X.key and Right subtree keys > X.key', 'Left subtree keys > X.key', 'All keys are equal', 'Nodes have at least 3 children', 'A', 1, 1),
            (v_content_id, 'Which traversal of a BST produces elements in strictly ascending sorted order?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B', 1, 2),
            (v_content_id, 'What is the worst-case time complexity of searching in an unbalanced / skewed BST with N nodes?', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'C', 1, 3),
            (v_content_id, 'What is the average time complexity of insertion and search in a balanced BST?', 'O(1)', 'O(log N)', 'O(N)', 'O(N^2)', 'B', 1, 4),
            (v_content_id, 'When deleting a node with two children from a BST, which node replaces it?', 'The root node', 'In-order Successor (or In-order Predecessor)', 'A random leaf node', 'Its parent node', 'B', 1, 5),
            (v_content_id, 'Where is the in-order successor of a node located in a BST if its right subtree is non-empty?', 'The leftmost node in its right subtree', 'The rightmost node in its left subtree', 'Its parent node', 'The root node', 'A', 1, 6),
            (v_content_id, 'Which self-balancing binary search tree maintains a balance factor of -1, 0, or +1 for every node?', 'Red-Black Tree', 'AVL Tree', 'B-Tree', 'Splay Tree', 'B', 1, 7),
            (v_content_id, 'What is the maximum allowed height difference between left and right subtrees in an AVL tree?', '0', '1', '2', '3', 'B', 1, 8),
            (v_content_id, 'What rotation is performed in an AVL tree to balance a Left-Right (LR) heavy subtree?', 'Single Left rotation', 'Left rotation on left child, then Right rotation on root', 'Right rotation on right child, then Left rotation on root', 'Single Right rotation', 'B', 2, 9),
            (v_content_id, 'In a Red-Black tree, what color is the root node guaranteed to be?', 'Red', 'Black', 'Blue', 'Either Red or Black', 'B', 2, 10);
        END IF;

        -- 14. Heaps and Priority Queues
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Heaps and Priority Queues' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What property defines a Max-Heap?', 'Parent node key >= children node keys, and root holds maximum element', 'Parent node key <= children node keys', 'All leaves have equal values', 'Left child is always greater than right child', 'A', 1, 1),
            (v_content_id, 'A Binary Heap is structured as what type of binary tree?', 'Degenerate Tree', 'Complete Binary Tree', 'Full Binary Tree with odd height', 'BST', 'B', 1, 2),
            (v_content_id, 'In a 0-indexed array representation of a binary heap, the left child of node i is at:', '2i', '2i + 1', '2i + 2', 'i / 2', 'B', 1, 3),
            (v_content_id, 'In a 0-indexed array binary heap, the parent of node i is located at:', 'floor((i - 1) / 2)', '2i', 'i - 1', 'i + 1', 'A', 1, 4),
            (v_content_id, 'What is the time complexity to extract the maximum element (root) from a Max-Heap with N elements?', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'B', 1, 5),
            (v_content_id, 'What is the time complexity of the Build-Heap operation on an unsorted array of size N?', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'C', 1, 6),
            (v_content_id, 'What is the total time complexity of Heap Sort on an array of size N?', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(log N)', 'B', 1, 7),
            (v_content_id, 'Which data structure is most efficiently used to implement a Priority Queue ADT?', 'Unsorted Array', 'Binary Heap', 'Singly Linked List', 'Stack', 'B', 1, 8),
            (v_content_id, 'What is the time complexity to insert a new element into a binary heap of size N?', 'O(1)', 'O(log N)', 'O(N)', 'O(N^2)', 'B', 2, 9),
            (v_content_id, 'In Huffman Coding for data compression, which data structure extracts the two lowest frequency trees iteratively?', 'Stack', 'Min-Heap (Priority Queue)', 'Circular Queue', 'Hash Table', 'B', 2, 10);
        END IF;

        -- 15. Graphs
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Graphs' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is the space complexity of an Adjacency Matrix representation for a graph with V vertices?', 'O(V)', 'O(V + E)', 'O(V^2)', 'O(E^2)', 'C', 1, 1),
            (v_content_id, 'What is the space complexity of an Adjacency List representation for a graph G = (V, E)?', 'O(V^2)', 'O(V + E)', 'O(E^2)', 'O(V * E)', 'B', 1, 2),
            (v_content_id, 'Which data structure is used in Breadth-First Search (BFS) graph traversal?', 'Stack', 'Queue', 'Min-Heap', 'Priority Queue', 'B', 1, 3),
            (v_content_id, 'Which data structure or paradigm is used in Depth-First Search (DFS) graph traversal?', 'Queue', 'Stack / System Recursion', 'Circular Buffer', 'Hash Map', 'B', 1, 4),
            (v_content_id, 'What is the time complexity of BFS or DFS on a graph represented using adjacency lists?', 'O(V)', 'O(V + E)', 'O(V * E)', 'O(V^2)', 'B', 1, 5),
            (v_content_id, 'Topological Sorting can only be performed on which type of graph?', 'Undirected Graph', 'Directed Acyclic Graph (DAG)', 'Complete Graph', 'Cyclic Graph with negative weights', 'B', 1, 6),
            (v_content_id, 'What is the time complexity of Dijkstra single-source shortest path algorithm using a Min-Heap?', 'O(V^2)', 'O((V + E) log V)', 'O(V * E)', 'O(E^2)', 'B', 1, 7),
            (v_content_id, 'Which algorithm detects negative weight cycles in a directed graph?', 'Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Prim Algorithm', 'Kruskal Algorithm', 'B', 1, 8),
            (v_content_id, 'Kruskal algorithm finds the Minimum Spanning Tree (MST) using which auxiliary data structure?', 'Stack', 'Disjoint Set Union (Union-Find)', 'Binary Search Tree', 'Circular Queue', 'B', 2, 9),
            (v_content_id, 'What is the maximum number of edges in a simple undirected graph with V vertices?', 'V', 'V - 1', 'V(V - 1) / 2', 'V^2', 'C', 2, 10);
        END IF;

        -- 16. Greedy Algorithms
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Greedy Algorithms' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What is the core principle of a Greedy Algorithm?', 'Backtracking through all possible combinations', 'Making the locally optimal choice at each step hoping for global optimum', 'Breaking problem into overlapping subproblems with memoization', 'Brute force search', 'B', 1, 1),
            (v_content_id, 'In the Activity Selection problem, how should activities be sorted for the greedy choice?', 'By start time ascending', 'By finish time ascending', 'By duration descending', 'By activity ID', 'B', 1, 2),
            (v_content_id, 'What is the time complexity of solving Activity Selection with N activities (including sorting)?', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(2^N)', 'B', 1, 3),
            (v_content_id, 'In the Fractional Knapsack problem, items are sorted by which ratio?', 'Weight / Value', 'Value / Weight (vi / wi)', 'Total Value only', 'Total Weight only', 'B', 1, 4),
            (v_content_id, 'Why does the Greedy approach solve Fractional Knapsack but fail on 0/1 Knapsack?', '0/1 Knapsack requires taking entire items without fractions, creating non-greedy substructure', '0/1 Knapsack has no weights', 'Fractional Knapsack cannot be sorted', 'Greedy algorithms only work on graphs', 'A', 1, 5),
            (v_content_id, 'Which Minimum Spanning Tree algorithm grows a tree vertex by vertex starting from an arbitrary root?', 'Kruskal Algorithm', 'Prim Algorithm', 'Dijkstra Algorithm', 'Floyd-Warshall', 'B', 1, 6),
            (v_content_id, 'Which Minimum Spanning Tree algorithm sorts all edges by weight and adds edges if they do not create a cycle?', 'Prim Algorithm', 'Kruskal Algorithm', 'Bellman-Ford', 'KMP Algorithm', 'B', 1, 7),
            (v_content_id, 'In Huffman Coding, what type of codes are generated to ensure no code is a prefix of another?', 'Prefix Codes (Prefix-Free)', 'Suffix Codes', 'Cyclic Codes', 'Gray Codes', 'A', 1, 8),
            (v_content_id, 'What two properties are essential for a problem to be solvable by a Greedy Algorithm?', 'Greedy Choice Property and Optimal Substructure', 'Overlapping Subproblems and Exhaustive Search', 'Recursion and Stack Overflow', 'Memoization and Tabulation', 'A', 2, 9),
            (v_content_id, 'In Job Sequencing with Deadlines and Profits, sorting jobs by decreasing profit yields which overall time complexity?', 'O(N^2) or O(N log N with Disjoint Set)', 'O(N)', 'O(2^N)', 'O(N!)', 'A', 2, 10);
        END IF;

        -- 17. Dynamic Programming
        SELECT s.subtopic_id, sc.content_id INTO v_subtopic_id, v_content_id
        FROM subtopics s JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
        WHERE s.topic_id = v_topic_id AND s.title = 'Dynamic Programming' LIMIT 1;
        IF v_content_id IS NOT NULL THEN
            UPDATE subtopic_content SET time_limit = 15 WHERE content_id = v_content_id;
            DELETE FROM subtopic_quiz_questions WHERE content_id = v_content_id;
            INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
            (v_content_id, 'What two essential properties must a problem exhibit to be effectively solved by Dynamic Programming?', 'Overlapping Subproblems and Optimal Substructure', 'Greedy Choice and Constant Time', 'Linearity and Symmetry', 'Non-recursive loops and Array sorting', 'A', 1, 1),
            (v_content_id, 'What is the Memoization approach in Dynamic Programming?', 'Top-Down recursive approach storing computed subproblem results in a table / cache', 'Bottom-Up iterative table filling', 'Greedy choice selection', 'Randomized sampling', 'A', 1, 2),
            (v_content_id, 'What is the Tabulation approach in Dynamic Programming?', 'Top-Down recursion with caching', 'Bottom-Up iterative approach building solutions from base cases up to N', 'Divide and conquer without caching', 'Depth First Search', 'B', 1, 3),
            (v_content_id, 'What is the time complexity of solving the 0/1 Knapsack problem with N items and capacity W using DP?', 'O(2^N)', 'O(N * W)', 'O(N + W)', 'O(N^2 * W)', 'B', 1, 4),
            (v_content_id, 'What is the time complexity of finding the Longest Common Subsequence (LCS) of two strings of lengths m and n using DP?', 'O(m + n)', 'O(m * n)', 'O(2^(m+n))', 'O(m^2 * n^2)', 'B', 1, 5),
            (v_content_id, 'What is the time complexity of the Matrix Chain Multiplication problem with N matrices using DP?', 'O(N)', 'O(N^2)', 'O(N^3)', 'O(2^N)', 'C', 1, 6),
            (v_content_id, 'In the Coin Change Problem (minimum coins to make amount A with N coin types), what is the DP time complexity?', 'O(N * A)', 'O(2^N)', 'O(N + A)', 'O(A^2)', 'A', 1, 7),
            (v_content_id, 'How can the space complexity of the Tabulation DP Fibonacci algorithm be optimized to O(1)?', 'By keeping only the two most recent values (prev1, prev2)', 'By running recursion in parallel', 'By sorting the numbers', 'By increasing memory cache', 'A', 1, 8),
            (v_content_id, 'What is the recurrence relation for the Longest Common Subsequence DP[i][j] when text1[i-1] == text2[j-1]?', 'DP[i][j] = 1 + DP[i-1][j-1]', 'DP[i][j] = max(DP[i-1][j], DP[i][j-1])', 'DP[i][j] = DP[i-1][j-1] * 2', 'DP[i][j] = 0', 'A', 2, 9),
            (v_content_id, 'Which shortest path algorithm uses Dynamic Programming to find all-pairs shortest paths in O(V^3) time?', 'Dijkstra Algorithm', 'Floyd-Warshall Algorithm', 'Prim Algorithm', 'Kruskal Algorithm', 'B', 2, 10);
        END IF;

    END IF;
END $seed_all_quizzes_block$;

COMMIT;
