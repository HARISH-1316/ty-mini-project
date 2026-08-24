-- =========================================================
-- WCE VIRTUAL LAB — DATA STRUCTURES & ALGORITHMS (DSA) SEED
-- =========================================================

BEGIN;

-- 1. Insert Main Topic: Data Structures and Algorithms
INSERT INTO topics (title, description)
SELECT 'Data Structures and Algorithms', 'Comprehensive study of linear and non-linear data structures, algorithm analysis, searching, sorting, trees, graphs, greedy approaches, and dynamic programming.'
WHERE NOT EXISTS (
    SELECT 1 FROM topics WHERE title = 'Data Structures and Algorithms'
);

-- PL/pgSQL Block to safely insert Subtopics and Content
DO $seed_block$
DECLARE
    v_topic_id INT;
    v_subtopic_id INT;
BEGIN
    SELECT topic_id INTO v_topic_id FROM topics WHERE title = 'Data Structures and Algorithms' LIMIT 1;

    -- =========================================================
    -- 1. Introduction to Data Structures and Algorithms
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Introduction to Data Structures and Algorithms') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Introduction to Data Structures and Algorithms', 1, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Understand the fundamental concepts of data structures, algorithm design principles, classification, and their role in computer science problem solving.$aim$,
            $theory$## Definition
A **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data efficiently in computer memory. An **Algorithm** is a finite, step-by-step set of well-defined instructions designed to solve a specific problem or perform a computation.

## Introduction
In software engineering, choosing the appropriate data structure and algorithm directly influences system efficiency, execution time, and memory footprint. Data structures provide the blueprint for structuring data, while algorithms define the procedural logic acting upon that data.

## Core Concept
- **Linear Data Structures**: Data elements are arranged sequentially (e.g., Arrays, Linked Lists, Stacks, Queues).
- **Non-Linear Data Structures**: Data elements are arranged hierarchically or interconnected randomly (e.g., Trees, Graphs).
- **Static Data Structures**: Fixed memory allocation determined at compile-time (e.g., Arrays).
- **Dynamic Data Structures**: Dynamic memory allocation modified at runtime (e.g., Linked Lists, Dynamic Trees).

## Working / Principle
An algorithm takes zero or more inputs, processes them through deterministic operations, and yields output within finite execution steps. Data structures store elements in memory addresses structured to optimize operations such as lookup, insertion, deletion, and traversal.

## Important Operations
1. **Traversal**: Accessing every element in the structure exactly once.
2. **Insertion**: Adding a new element into the structure.
3. **Deletion**: Removing an existing element from the structure.
4. **Searching**: Locating the target element within the structure.
5. **Sorting**: Arranging elements in a specified order (ascending/descending).
6. **Merging**: Combining two structures into a unified structure.

## Code Example: Abstract Data Types (ADT) Concept in C++
```cpp
#include <iostream>
using namespace std;

// Basic Abstract Representation of an Array Container
struct StaticArrayContainer {
    int data[5] = {10, 20, 30, 40, 50};
    int size = 5;

    void traverse() {
        cout << "Container Elements: ";
        for(int i = 0; i < size; i++) {
            cout << data[i] << " ";
        }
        cout << endl;
    }
};

int main() {
    StaticArrayContainer container;
    container.traverse();
    return 0;
}
```

## Time & Space Complexity Characteristics
- Access Time: O(1) for indexed static arrays, O(n) for sequential lists.
- Memory Overhead: Fixed array allocation vs pointer node overhead in linked structures.

## Applications
- Operating System process schedulers and memory allocation managers.
- Database indexing algorithms (B-Trees, Hash Tables).
- Web browser history navigation (Stack ADT) and web crawlers (Queue / Graph algorithms).

## Important Points
- Algorithm correctness requires finiteness, definiteness, input, output, and effectiveness.
- Space and time trade-offs frequently dictate the selection of a data structure.

## Common Mistakes
- Confusing abstract data types (interfaces) with concrete data structures (implementations).
- Neglecting edge cases such as empty structures or memory overflows.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 2. Complexity Analysis
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Complexity Analysis') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Complexity Analysis', 2, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Master asymptotic analysis techniques (Big-O, Big-Omega, Big-Theta) to evaluate program performance in terms of running time and memory consumption.$aim$,
            $theory$## Definition
**Complexity Analysis** is the theoretical framework used to quantify the efficiency of an algorithm as a function of the input size n, measuring growth rates of execution time (Time Complexity) and memory utilization (Space Complexity).

## Introduction
Hardware execution speeds vary across processors, so measuring raw execution time in seconds is inconsistent. Asymptotic notation provides an machine-independent metric to compare algorithm scalability as input size grows toward infinity.

## Asymptotic Notations
1. **Big-O Notation (O)**: Represents the strict upper bound (worst-case scenario).
2. **Big-Omega Notation (Ω)**: Represents the strict lower bound (best-case scenario).
3. **Big-Theta Notation (Θ)**: Represents the tight bound (exact growth rate when upper and lower bounds match).

## Standard Complexity Orders (Fastest to Slowest)
- O(1) — Constant Time
- O(log n) — Logarithmic Time
- O(n) — Linear Time
- O(n log n) — Linearithmic / Log-Linear Time
- O(n^2) — Quadratic Time
- O(2^n) — Exponential Time
- O(n!) — Factorial Time

## Working / Principle
Count the total fundamental operations (comparisons, arithmetic operations, assignments) executed by code loops and recursive calls as a mathematical function f(n), then discard constant multipliers and lower-order terms.

## Code Example: Analyzing Nested Loops
```cpp
// Time Complexity: O(n^2) Quadratic
void matrixMultiplication(int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {           // Runs n times
        for (int j = 0; j < n; j++) {       // Runs n times per outer iteration
            count++;                       // Total execution = n * n
        }
    }
}

// Time Complexity: O(log n) Logarithmic
void logarithmicDecrease(int n) {
    while (n > 1) {
        n = n / 2;                         // Divides input in half each step
    }
}
```

## Space Complexity Components
- **Auxiliary Space**: Temporary or extra space used by the algorithm.
- **Total Space Complexity**: Input size space + Auxiliary space.

## Applications
- High-frequency trading algorithms requiring guaranteed O(1) sub-millisecond execution bounds.
- Embedded system software operating under tight RAM limits.

## Important Points
- Drop constants (O(2n) -> O(n)) and lower-order terms (O(n^2 + 5n) -> O(n^2)).
- Recursion stack space contributes to Auxiliary Space Complexity.

## Common Mistakes
- Assuming loop counters always imply O(n) without inspecting variable step increments (j *= 2 is logarithmic).
- Ignoring auxiliary memory overhead incurred by recursive call stacks.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 3. Arrays
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Arrays') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Arrays', 3, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Explore contiguous linear arrays, memory address calculations, 1D/2D operations, and sliding window / two-pointer algorithms.$aim$,
            $theory$## Definition
An **Array** is a linear data structure containing a fixed-size collection of homogenous elements stored in contiguous memory locations accessed via zero-based numerical indices.

## Introduction
Arrays are the foundational data structure supported natively by almost all hardware architectures and programming languages. Because elements reside next to each other in memory, random access via indices occurs in constant time.

## Core Concept
- **Base Address**: The starting physical RAM address of element at index 0 (B).
- **Element Size**: Memory footprint of a single element type in bytes (w).
- **Address Calculation Formula (1D Array)**:
  Address(A[i]) = B + (i * w)
- **Address Calculation Formula (2D Array Row-Major)**:
  Address(A[i][j]) = B + ((i * C) + j) * w
  *(where C is total columns)*

## Important Operations & Complexity
- **Random Access**: O(1)
- **Insertion at End**: O(1) (Amortized for dynamic arrays)
- **Insertion at Start/Middle**: O(n) (Requires element shifting)
- **Deletion at Start/Middle**: O(n) (Requires element shifting)
- **Search (Unsorted)**: O(n)
- **Search (Sorted)**: O(log n) (Binary Search)

## Code Example: Two-Pointer Technique (Reverse Array In-Place)
```cpp
#include <iostream>
#include <vector>
using namespace std;

void reverseArray(vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

int main() {
    vector<int> nums = {1, 2, 3, 4, 5};
    reverseArray(nums);
    for (int x : nums) cout << x << " "; // Output: 5 4 3 2 1
    return 0;
}
```

## Applications
- Lookup tables, image pixel buffers, CPU cache optimization (spatial locality).
- Implementation matrix transformations, linear algebra routines.

## Important Points
- High cache locality makes array iteration significantly faster than pointer-chasing structures like linked lists.
- Static arrays cannot resize once allocated.

## Common Mistakes
- Out-of-bounds array indexing resulting in buffer overflows or segmentation faults.
- Forgetting that insertion and deletion require O(n) time due to contiguous memory constraints.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 4. Strings
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Strings') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Strings', 4, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Study string representation, character encodings, pattern matching techniques, and string manipulation algorithms.$aim$,
            $theory$## Definition
A **String** is a sequence of characters stored sequentially in memory, terminated by a null character '\0' in traditional C-strings or managed dynamically as objects in modern programming languages.

## Introduction
Text processing is vital in software development, compilers, databases, and bioinformatics. Strings can be mutable (modifiable in-place like C char arrays) or immutable (creating new objects upon modification like Java strings).

## Core Concept
- **ASCII & Unicode/UTF-8**: Encoding schemes assigning numerical code points to character glyphs.
- **Pattern Matching Algorithms**:
  - Naive Matching: O((n-m+1) * m)
  - Knuth-Morris-Pratt (KMP): O(n + m) using Partial Match Prefix Table (LPS).
  - Rabin-Karp: O(n + m) using rolling hash functions.

## Important Operations
- Concatenation, Substring extraction, Character searching.
- Anagram testing, Palindrome verification, Pattern matching.

## Code Example: Check Palindrome using Two Pointers
```cpp
#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(const string& s) {
    int i = 0, j = s.length() - 1;
    while (i < j) {
        if (s[i] != s[j]) return false;
        i++;
        j--;
    }
    return true;
}

int main() {
    string str = "racecar";
    cout << (isPalindrome(str) ? "Palindrome" : "Not Palindrome") << endl;
    return 0;
}
```

## Time & Space Complexity
- Length Calculation: O(n) for null-terminated strings, O(1) for string instances storing explicit size.
- Concatenation: O(n + m).

## Applications
- Text editors, search engine indexing, computational genomics (DNA sequence alignment).
- Lexical analysis in compilers and parsers.

## Important Points
- Repeated string concatenation in loops without specialized builders causes quadratic O(n^2) allocation overhead in immutable languages.

## Common Mistakes
- Comparing string equality using reference memory equality (==) instead of value equality methods in languages like Java.
- Buffer overflow errors in C-style string functions like strcpy.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 5. Linked Lists
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Linked Lists') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Linked Lists', 5, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Implement singly, doubly, and circular linked lists, master pointer manipulations, dynamic memory insertion, and cycle detection.$aim$,
            $theory$## Definition
A **Linked List** is a dynamic linear data structure composed of nodes where each node contains a data payload and one or more pointers/references to neighboring nodes.

## Introduction
Unlike arrays, linked list nodes are allocated dynamically in heap memory and do not require contiguous memory blocks. Nodes are linked together via memory pointers.

## Types of Linked Lists
1. **Singly Linked List**: Each node points to the next node (head -> node1 -> node2 -> NULL).
2. **Doubly Linked List**: Each node contains pointers to both next and previous nodes (NULL <- node1 <-> node2 -> NULL).
3. **Circular Linked List**: The last node points back to the head node.

## Working / Principle
Pointer adjustments enable insertion and deletion operations in O(1) constant time if the reference location is already known, without requiring element shifting.

## Code Example: Singly Linked List Insertion and Traversal in C++
```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void insertAtHead(Node*& head, int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
}

void printList(Node* head) {
    Node* temp = head;
    while (temp != nullptr) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "NULL" << endl;
}

int main() {
    Node* head = nullptr;
    insertAtHead(head, 30);
    insertAtHead(head, 20);
    insertAtHead(head, 10);
    printList(head); // Output: 10 -> 20 -> 30 -> NULL
    return 0;
}
```

## Complexity Analysis
- Access / Search: O(n)
- Insertion at Head / Tail (with tail pointer): O(1)
- Deletion at Head: O(1)
- Deletion arbitrary given node pointer in Doubly Linked List: O(1)

## Applications
- Dynamic memory allocation freelists in OS kernels.
- Undo-redo functionalities in application software (Doubly Linked List).
- Navigation systems for playlist tracks.

## Important Points
- Floyd’s Cycle Detection (Tortoise and Hare) uses fast/slow pointers to detect loops in O(n) time and O(1) space.

## Common Mistakes
- Dereferencing nullptr pointers resulting in memory segmentation faults.
- Creating memory leaks by losing the head pointer reference without deallocating heap nodes.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 6. Stacks
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Stacks') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Stacks', 6, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Understand the Last-In-First-Out (LIFO) paradigm, array and linked list stack implementations, infix/postfix conversions, and expression evaluation.$aim$,
            $theory$## Definition
A **Stack** is a linear Abstract Data Type (ADT) operating on the **Last-In, First-Out (LIFO)** policy, where elements are added and removed strictly from a single end called the **Top**.

## Introduction
The stack models physical stack behavior (e.g., a stack of books). Operations occur exclusively at the top of the stack, preserving sequential reverse processing order.

## Core Operations & Complexity
- push(x): Inserts element x at the top — O(1)
- pop(): Removes and returns the top element — O(1)
- peek() / top(): Returns the top element without removal — O(1)
- isEmpty(): Checks whether the stack contains elements — O(1)

## Working / Principle
Under an array-based implementation, an index variable top tracks the current top index (initialized to -1). Pushing increments top, while popping decrements top. Underflow occurs when popping an empty stack (top == -1), while Overflow occurs when pushing onto a full static array.

## Code Example: Stack Evaluation of Balanced Parentheses
```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(string expr) {
    stack<char> s;
    for (char ch : expr) {
        if (ch == '(' || ch == '{' || ch == '[') {
            s.push(ch);
        } else {
            if (s.empty()) return false;
            char top = s.top();
            if ((ch == ')' && top == '(') ||
                (ch == '}' && top == '{') ||
                (ch == ']' && top == '[')) {
                s.pop();
            } else {
                return false;
            }
        }
    }
    return s.empty();
}

int main() {
    cout << (isBalanced("{[()]}") ? "Balanced" : "Unbalanced") << endl;
    return 0;
}
```

## Applications
- Function call execution stack management in CPU runtime.
- Expression parsing (Infix to Postfix/Prefix conversion using Shunting-Yard algorithm).
- Backtracking algorithms (DFS traversal, Maze solving).

## Important Points
- All primary stack operations perform in O(1) time complexity.

## Common Mistakes
- Calling pop() or top() on an empty stack leading to undefined behavior or crash.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 7. Queues
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Queues') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Queues', 7, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Implement First-In-First-Out (FIFO) queues, Circular Queues, Double-Ended Queues (Deque), and job scheduling queues.$aim$,
            $theory$## Definition
A **Queue** is a linear Abstract Data Type operating on the **First-In, First-Out (FIFO)** policy, where elements are inserted at the **Rear** (Enqueue) and removed from the **Front** (Dequeue).

## Introduction
Queues model real-world waiting lines where the earliest arrival receives initial service. They decouple processes executing at different speeds.

## Variants of Queue
1. **Linear Queue**: Array-based queue prone to false-overflow when rear reaches array capacity despite empty front slots.
2. **Circular Queue**: Connects the end of the array back to the start using modulo arithmetic ((rear + 1) % N).
3. **Double-Ended Queue (Deque)**: Allows insertion and deletion at both Front and Rear ends in O(1).
4. **Priority Queue**: Elements are dequeued according to assigned priority values rather than arrival order.

## Code Example: Circular Queue Implementation in C++
```cpp
#include <iostream>
using namespace std;

class CircularQueue {
    int *arr;
    int front, rear, size, capacity;
public:
    CircularQueue(int cap) {
        capacity = cap;
        arr = new int[capacity];
        front = -1;
        rear = -1;
        size = 0;
    }

    bool enqueue(int value) {
        if (size == capacity) return false; // Full
        if (front == -1) front = 0;
        rear = (rear + 1) % capacity;
        arr[rear] = value;
        size++;
        return true;
    }

    bool dequeue() {
        if (size == 0) return false; // Empty
        front = (front + 1) % capacity;
        size--;
        return true;
    }

    int getFront() { return size == 0 ? -1 : arr[front]; }
};

int main() {
    CircularQueue cq(3);
    cq.enqueue(10);
    cq.enqueue(20);
    cq.enqueue(30);
    cout << "Front: " << cq.getFront() << endl; // 10
    cq.dequeue();
    cout << "New Front: " << cq.getFront() << endl; // 20
    return 0;
}
```

## Complexity Analysis
- Enqueue: O(1)
- Dequeue: O(1)
- Front / Peek: O(1)

## Applications
- Operating System CPU process scheduling (Round-Robin).
- Asynchronous data buffers (IO communication, Print spoolers).
- Breadth-First Search (BFS) graph traversal algorithm.

## Common Mistakes
- Mismanaging index wrap-around modulo math in circular queues.
- Dequeuing empty queues causing underflow.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 8. Recursion
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Recursion') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Recursion', 8, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Master recursive thinking, base cases, recurrence relations, call stack dynamics, and tail call optimization.$aim$,
            $theory$## Definition
**Recursion** is a programming paradigm where a function calls itself directly or indirectly to solve a smaller instance of the same problem until reaching a defined **Base Case**.

## Introduction
Recursion decomposes complex algorithmic challenges into simpler sub-problems matching mathematical induction.

## Essential Components
1. **Base Case**: The non-recursive termination condition returning an immediate result.
2. **Recursive Step**: Reducing problem size n toward the base case (e.g., n-1 or n/2).

## Call Stack Execution
Each recursive function call allocates a new activation record on the runtime system call stack containing local variables, parameters, and return addresses. Stack frames are popped upon returning.

## Code Example: Binary Search (Recursive)
```cpp
#include <iostream>
#include <vector>
using namespace std;

int recursiveBinarySearch(const vector<int>& arr, int low, int high, int target) {
    // Base Case
    if (low > high) return -1;

    int mid = low + (high - low) / 2;

    if (arr[mid] == target) return mid;
    if (arr[mid] > target) 
        return recursiveBinarySearch(arr, low, mid - 1, target);
    
    return recursiveBinarySearch(arr, mid + 1, high, target);
}

int main() {
    vector<int> data = {2, 5, 8, 12, 16, 23, 38};
    int idx = recursiveBinarySearch(data, 0, data.size() - 1, 16);
    cout << "Element found at index: " << idx << endl; // Index 4
    return 0;
}
```

## Recurrence Relations & Solving Methods
- Factorial: T(n) = T(n-1) + O(1) => O(n)
- Divide & Conquer (Merge Sort): T(n) = 2T(n/2) + O(n) => O(n log n) (Solved via Master Theorem)

## Applications
- Tree traversals (In-order, Pre-order, Post-order).
- Divide and conquer algorithms (Quick Sort, Merge Sort).
- Backtracking (N-Queens, Sudoku solver).

## Common Mistakes
- Omitting the base case, leading to infinite recursion and StackOverflowError.
- Recomputing identical subproblems repeatedly (e.g., naive recursive Fibonacci in O(2^n) time without memoization).$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 9. Searching Algorithms
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Searching Algorithms') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Searching Algorithms', 9, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Compare Linear Search and Binary Search algorithms, ternary search, binary search space abstractions, and performance bounds.$aim$,
            $theory$## Definition
**Searching Algorithms** are computational procedures designed to locate a specific target value within a collection of data elements or determine its absence.

## Algorithms Covered
1. **Linear Search**: Sequentially checks every element from index 0 to n-1.
2. **Binary Search**: Efficiently searches a **sorted** collection by dividing the search interval in half repeatedly.

## Comparison Table
| Algorithm | Prerequisite | Worst-Case Time | Best-Case Time | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| Linear Search | None | O(n) | O(1) | O(1) |
| Binary Search | Sorted Order | O(log n) | O(1) | O(1) Iterative |

## Code Example: Iterative Binary Search
```cpp
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevents integer overflow
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> nums = {10, 20, 30, 40, 50};
    cout << "Index of 40: " << binarySearch(nums, 40) << endl; // Output 3
    return 0;
}
```

## Binary Search on Search Space (Advanced Principle)
Binary Search applies beyond explicit arrays to monotonic functions where decision spaces transition from True to False (TTTTFFFF). Used in optimization problems like finding minimum speed or optimal capacity.

## Applications
- Database index lookups, dictionary key queries.
- Square root approximations, numerical root finding.

## Common Mistakes
- Applying Binary Search on unsorted inputs.
- Integer overflow bug when computing mid = (low + high) / 2 instead of low + (high - low) / 2.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 10. Sorting Algorithms
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Sorting Algorithms') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Sorting Algorithms', 10, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Analyze comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap) and non-comparison sorting (Counting, Radix).$aim$,
            $theory$## Definition
**Sorting Algorithms** rearrange a collection of elements into a specified order (numerical or lexicographical).

## Key Classification Criteria
- **Stability**: A stable sort preserves the relative order of duplicate elements.
- **In-Place**: An in-place algorithm requires O(1) auxiliary memory (excluding recursive stacks).

## Summary of Core Sorting Algorithms
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| **Selection Sort**| O(n^2) | O(n^2) | O(n^2) | O(1) | No |
| **Insertion Sort**| O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| **Quick Sort** | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

## Code Example: Quick Sort (Lomuto Partition)
```cpp
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
```

## Lower Bound of Comparison-Based Sorting
Any comparison-based sorting algorithm requires at least Ω(n log n) comparisons in the worst case (proven via Decision Trees).

## Applications
- Order statistics, graphics rendering Z-buffers, database query execution engines (ORDER BY).$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 11. Hashing
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Hashing') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Hashing', 11, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Master hash functions, collision resolution strategies (Chaining, Linear Probing, Quadratic Probing, Double Hashing), and Hash Tables.$aim$,
            $theory$## Definition
**Hashing** is a technique that maps key data of arbitrary size into fixed-size integer values called **Hash Codes** using a mathematical function (Hash Function), enabling constant time O(1) operations on average.

## Core Concepts
- **Hash Table**: An array storing key-value pairs indexed by hash values.
- **Hash Function**: h(k) = k mod m (Division method), mapping key k to table index.
- **Collision**: Occurs when two distinct keys yield identical hash table indices (h(k1) = h(k2)).

## Collision Resolution Techniques
1. **Separate Chaining (Open Hashing)**: Each table bucket maintains a linked list of colliding records.
2. **Open Addressing (Closed Hashing)**: All elements reside inside the table array. Collisions trigger probing sequence lookups:
   - *Linear Probing*: h(k, i) = (h'(k) + i) mod m
   - *Quadratic Probing*: h(k, i) = (h'(k) + c1*i + c2*i^2) mod m
   - *Double Hashing*: h(k, i) = (h1(k) + i * h2(k)) mod m

## Code Example: Hash Set Operations in C++ (STL Unordered Set)
```cpp
#include <iostream>
#include <unordered_set>
using namespace std;

int main() {
    unordered_set<int> hashSet;
    hashSet.insert(10);
    hashSet.insert(25);
    hashSet.insert(40);

    if (hashSet.find(25) != hashSet.end()) {
        cout << "Key 25 found in hash table!" << endl;
    }
    return 0;
}
```

## Performance & Load Factor
- **Load Factor (α)**: α = n / m (Number of entries n divided by total buckets m).
- When α > 0.75, dynamic rehashing expands table size to maintain O(1) search bounds.

## Applications
- Database indexing, associative arrays/dictionaries in standard libraries.
- Cryptography (SHA-256), caching mechanisms, set intersection algorithms.

## Common Mistakes
- Using poor hash functions causing clustering and degrading operations from O(1) to O(n).$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 12. Trees
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Trees') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Trees', 12, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Understand non-linear tree structures, terminology, binary tree properties, and Depth-First / Breadth-First traversals.$aim$,
            $theory$## Definition
A **Tree** is a non-linear hierarchical data structure consisting of nodes connected by directed edges, with a designated top node called the **Root** and no cycles.

## Terminologies
- **Root**: Topmost node without parents.
- **Parent / Child**: Ancestor and descendant relationship connected by an edge.
- **Leaf Node**: Node with zero children.
- **Height of Tree**: Length of longest path from root to leaf.
- **Depth of Node**: Number of edges from root to that node.

## Binary Trees
A tree where every node has at most two children (**Left** and **Right**).
- *Full Binary Tree*: Every node has either 0 or 2 children.
- *Perfect Binary Tree*: All internal nodes have 2 children and leaf nodes are at identical depth. Total nodes N = 2^(h+1) - 1.
- *Complete Binary Tree*: All levels are filled except possibly the last level, filled left-to-right.

## Traversals
1. **Pre-Order (DFS)**: Root -> Left -> Right
2. **In-Order (DFS)**: Left -> Root -> Right
3. **Post-Order (DFS)**: Left -> Right -> Root
4. **Level-Order (BFS)**: Visited level-by-level using Queue ADT.

## Code Example: Recursive In-Order Traversal
```cpp
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

void inOrder(TreeNode* root) {
    if (root == nullptr) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}
```

## Time Complexity
- Traversal of all nodes: O(n)
- Space Complexity: O(h) auxiliary recursion stack where h is tree height.

## Applications
- Abstract Syntax Trees (AST) in compilers.
- DOM structure in HTML rendering engines.
- File system directories.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 13. Binary Search Trees
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Binary Search Trees') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Binary Search Trees', 13, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Study Binary Search Tree (BST) ordering properties, insertion, deletion cases, searching, and self-balancing BST trees (AVL, Red-Black).$aim$,
            $theory$## Definition
A **Binary Search Tree (BST)** is a node-based binary tree structured such that for every node X:
- All keys in X’s left subtree are strictly smaller than X.key.
- All keys in X’s right subtree are strictly greater than X.key.

## Property
**In-Order Traversal of a BST produces elements in strictly sorted ascending order.**

## Operations & Case Analysis
1. **Search & Insertion**: Compare target key with current node, branching left if smaller or right if larger (O(h) time).
2. **Deletion**:
   - *Case 1 (Leaf node)*: Remove directly.
   - *Case 2 (One child)*: Replace node with its single child.
   - *Case 3 (Two children)*: Swap node value with its **In-Order Successor** (smallest key in right subtree) or **In-Order Predecessor**, then delete that successor node.

## Code Example: BST Search and Insertion
```cpp
#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int item) : key(item), left(nullptr), right(nullptr) {}
};

Node* insert(Node* node, int key) {
    if (node == nullptr) return new Node(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    return node;
}
```

## Complexity Analysis
- Balanced BST (e.g. AVL, Red-Black): Search/Insert/Delete in O(log n) time.
- Skewed BST (Worst Case): Degenerates into a linear list with O(n) time complexity.

## Applications
- Maintaining dynamically sorted streams of data.
- Symbol tables in compilers.
- Self-balancing trees power standard set/map containers (std::map).$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 14. Heaps and Priority Queues
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Heaps and Priority Queues') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Heaps and Priority Queues', 14, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Implement Max/Min Binary Heaps, array representation, Heapify procedures, Heap Sort, and Priority Queue ADT.$aim$,
            $theory$## Definition
A **Binary Heap** is a Complete Binary Tree maintaining the **Heap Property**:
- **Max-Heap**: Key of parent node >= keys of its children. Root holds maximum element.
- **Min-Heap**: Key of parent node <= keys of its children. Root holds minimum element.

## Array Representation Formula
Binary heaps are stored sequentially in zero-indexed arrays without explicit node pointers:
- Left Child of node i: 2i + 1
- Right Child of node i: 2i + 2
- Parent of node i: floor((i - 1)/2)

## Core Operations
1. **Heapify**: Restores heap property downward in O(log n) time.
2. **Build Heap**: Transforms unsorted array of size n into heap in O(n) time.
3. **Extract Min/Max**: Removes root node, moves last element to root, calls Heapify in O(log n).

## Code Example: C++ Priority Queue (Max Heap)
```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    priority_queue<int> maxHeap;
    maxHeap.push(30);
    maxHeap.push(10);
    maxHeap.push(50);

    cout << "Highest Priority Element: " << maxHeap.top() << endl; // 50
    maxHeap.pop();
    cout << "Next Priority Element: " << maxHeap.top() << endl; // 30
    return 0;
}
```

## Applications
- Dijkstra’s Shortest Path and Prim’s Minimum Spanning Tree algorithms.
- Operating system task schedulers (OS process priorities).
- Huffman Coding compression.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 15. Graphs
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Graphs') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Graphs', 15, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Represent graphs using Adjacency Matrix/Lists, implement BFS and DFS traversals, topological sort, and shortest path algorithms.$aim$,
            $theory$## Definition
A **Graph** G = (V, E) is a non-linear data structure consisting of a set of vertices (nodes) V and a set of edges E connecting pairs of vertices.

## Classifications
- **Directed vs Undirected**: Edges have specified direction or bidirectional traversal.
- **Weighted vs Unweighted**: Edges carry numerical costs/weights.
- **Cyclic vs Acyclic**: Graphs containing closed walk paths or none (DAG).

## Representations
1. **Adjacency Matrix**: V x V 2D array (O(V^2) space, O(1) edge checking).
2. **Adjacency List**: Array of vectors storing neighboring nodes (O(V + E) space, space-efficient for sparse graphs).

## Traversals
- **Breadth-First Search (BFS)**: Explores nodes level-by-level using Queue (O(V + E)).
- **Depth-First Search (DFS)**: Explores paths deeply along branches using Stack / Recursion (O(V + E)).

## Code Example: Graph Representation and BFS Traversal
```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void BFS(int startNode, int V, const vector<vector<int>>& adj) {
    vector<bool> visited(V, false);
    queue<int> q;

    visited[startNode] = true;
    q.push(startNode);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}
```

## Key Algorithms
- **Dijkstra’s Algorithm**: Single-source shortest paths on non-negative weighted graphs (O((V + E) log V)).
- **Topological Sorting**: Linear ordering of vertices in Directed Acyclic Graphs (DAG).

## Applications
- Social networks (connections graph), Google Maps navigation, Network routing protocols.$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 16. Greedy Algorithms
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Greedy Algorithms') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Greedy Algorithms', 16, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Understand greedy choice property, optimal substructure, Fractional Knapsack, Activity Selection, Prim’s and Kruskal’s algorithms.$aim$,
            $theory$## Definition
A **Greedy Algorithm** builds up a solution piece by piece, always selecting the choice that offers the most immediate local advantage (**Greedy Choice Property**) without reconsidering past decisions.

## Core Properties Required
1. **Greedy Choice Property**: A globally optimal solution can be reached by making locally optimal choices.
2. **Optimal Substructure**: An optimal solution to the problem contains within it optimal solutions to subproblems.

## Classic Problems & Logic
- **Activity Selection Problem**: Sort activities by finish times, greedily select next non-overlapping activity.
- **Fractional Knapsack**: Sort items by value-to-weight ratio (vi/wi), take complete items or fractions greedily (O(n log n)).
- **Kruskal’s Minimum Spanning Tree (MST)**: Sort all graph edges by weight, add edges greedily using Union-Find to avoid cycles.

## Code Example: Fractional Knapsack Implementation
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Item {
    int value, weight;
};

bool cmp(Item a, Item b) {
    double r1 = (double)a.value / a.weight;
    double r2 = (double)b.value / b.weight;
    return r1 > r2;
}

double fractionalKnapsack(int W, vector<Item>& items) {
    sort(items.begin(), items.end(), cmp);
    double totalValue = 0.0;
    for (auto& item : items) {
        if (W >= item.weight) {
            W -= item.weight;
            totalValue += item.value;
        } else {
            totalValue += item.value * ((double)W / item.weight);
            break;
        }
    }
    return totalValue;
}
```

## Limitations
Greedy algorithms fail on problems lacking greedy choice properties (e.g., 0/1 Knapsack problem requires Dynamic Programming).$theory$,
            NULL
        );
    END IF;

    -- =========================================================
    -- 17. Dynamic Programming
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM subtopics WHERE topic_id = v_topic_id AND title = 'Dynamic Programming') THEN
        INSERT INTO subtopics (topic_id, title, order_index, is_published)
        VALUES (v_topic_id, 'Dynamic Programming', 17, TRUE)
        RETURNING subtopic_id INTO v_subtopic_id;

        INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url)
        VALUES (
            v_subtopic_id,
            $aim$Master Dynamic Programming principles, Memoization (Top-Down), Tabulation (Bottom-Up), state formulations, and classic DP problems.$aim$,
            $theory$## Definition
**Dynamic Programming (DP)** is an algorithmic optimization technique that solves complex problems by breaking them down into overlapping subproblems, storing computed subproblem solutions to prevent redundant calculations.

## Core Prerequisites
1. **Overlapping Subproblems**: The recursive space evaluates identical subproblems repeatedly.
2. **Optimal Substructure**: Optimal solution to problem n depends directly on optimal solutions of subproblems.

## DP Approaches
- **Top-Down (Memoization)**: Recursive algorithm enhanced by storing subproblem results in a hash table / lookup array.
- **Bottom-Up (Tabulation)**: Iterative algorithm filling a DP table starting from initial base states up to target state N.

## Classic Problem: 0/1 Knapsack State Recurrence
Given n items with weights wi and values vi, and knapsack capacity W:
DP[i][j] = max(DP[i-1][j], vi + DP[i-1][j - wi])

## Code Example: Longest Common Subsequence (LCS) Tabulation
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size(), n = text2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

## Time vs Space Optimization
- Reduces exponential time complexity O(2^n) down to polynomial time O(n^2) or O(n * W).
- State space can often be compressed from O(n^2) down to O(n) by retaining only recent state vectors.$theory$,
            NULL
        );
    END IF;

END $seed_block$;

COMMIT;
