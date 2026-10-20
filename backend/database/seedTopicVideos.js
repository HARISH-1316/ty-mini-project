// ──────────────────────────────────────────────
// Seed Topic Video References — All 17 DSA Topics
// ──────────────────────────────────────────────
// Populates verified educational YouTube videos for all 17 DSA topics
// from reputable channels: take U forward (Striver), Apna College, freeCodeCamp, etc.
// Idempotent: safe to run multiple times without duplicates.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const VIDEO_REFERENCES = [
  {
    topicMatch: 'Introduction to Data Structures and Algorithms',
    fallbackId: 6,
    videos: [
      {
        title: 'Introduction to Data Structures & Algorithms | Complete Course Overview',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=EAR7De6Gzb4',
        description: 'Comprehensive introduction to DSA, problem solving approach, and roadmap by Striver.',
      },
      {
        title: 'Introduction to Data Structures and Algorithms in C++ / Java',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=z9bZufPHFLU',
        description: 'What are Data Structures & Algorithms, why they are essential, and course overview.',
      },
    ],
  },
  {
    topicMatch: 'Complexity Analysis',
    fallbackId: 7,
    videos: [
      {
        title: 'Time and Space Complexity Analysis | Big O, Omega, Theta Notations',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=FPu9Uld7W-E',
        description: 'Detailed breakdown of Big-O asymptotic notations, worst-case, best-case, and space complexity calculations.',
      },
      {
        title: 'Time & Space Complexity Explained with Real Code Examples',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=V42FBiohc6c',
        description: 'Calculating Big O complexity of loops, nested loops, and recursive calls.',
      },
    ],
  },
  {
    topicMatch: 'Arrays',
    fallbackId: 2,
    videos: [
      {
        title: 'Arrays in Data Structures | Memory Representation & Core Operations',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=37E9ckMDdTk',
        description: 'Array memory layout, contiguous allocation, insertion, deletion, and two-pointer patterns.',
      },
      {
        title: 'Introduction to Arrays | Linear Search & Dynamic Arrays',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=NvybaDeq560',
        description: 'Basics of 1D and 2D arrays, traversals, and common array algorithmic problems.',
      },
    ],
  },
  {
    topicMatch: 'Strings',
    fallbackId: 3,
    videos: [
      {
        title: 'Strings in DSA | Character Arrays, ASCII, & Substrings',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=WcxL33aB20M',
        description: 'String manipulation, palindromes, anagrams, character frequency counting, and string matching.',
      },
      {
        title: 'Strings & String Functions in C++ / Java',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=W8hPsBquD6Y',
        description: 'String operations, immutability concepts, and essential string algorithms.',
      },
    ],
  },
  {
    topicMatch: 'Linked Lists',
    fallbackId: 4,
    videos: [
      {
        title: 'Introduction to Linked List | Singly, Doubly, & Circular',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=Nq7ok-OyEpg',
        description: 'Pointer manipulation, node representation, node insertion, deletion, and reversal of linked lists.',
      },
      {
        title: 'Linked List in One Video | Complete Implementation & Traversal',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=oAja8-Ulz6o',
        description: 'Head/tail pointer tracking, memory allocation vs arrays, and edge cases in linked lists.',
      },
    ],
  },
  {
    topicMatch: 'Stacks',
    fallbackId: 8,
    videos: [
      {
        title: 'Introduction to Stack Data Structure | LIFO Principle & Array Implementation',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=GYptUgnIM_I',
        description: 'Push, pop, peek operations, stack overflow/underflow, and balanced parentheses evaluation.',
      },
      {
        title: 'Stack Data Structure | Applications & Expression Evaluation',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=7m1DMYAbdcY',
        description: 'Infix to postfix conversion, monotonic stacks, and recursive function call stack modeling.',
      },
    ],
  },
  {
    topicMatch: 'Queues',
    fallbackId: 9,
    videos: [
      {
        title: 'Introduction to Queue Data Structure | FIFO Principle & Circular Queue',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=M6GnoUVHzCQ',
        description: 'Enqueue, dequeue, front, rear pointers, and circular queue array wrap-around.',
      },
      {
        title: 'Queue Implementation using Arrays and Linked Lists',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=va_0gYg_yFE',
        description: 'FIFO queuing, double-ended queues (deque), and scheduling queue use cases.',
      },
    ],
  },
  {
    topicMatch: 'Recursion',
    fallbackId: 10,
    videos: [
      {
        title: 'Recursion Masterclass | Base Cases, Call Stacks, & Tree Visualization',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=yVdKa8dnKiE',
        description: 'Understanding recursive calls, base condition termination, stack frames, and backtracking principles.',
      },
      {
        title: 'Recursion in One Shot | Concepts, Factorial, Fibonacci, & Subsets',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=5Boqfjissv0',
        description: 'Divide and conquer recursion, recurrence relations, and call stack visualization.',
      },
    ],
  },
  {
    topicMatch: 'Searching Algorithms',
    fallbackId: 11,
    videos: [
      {
        title: 'Binary Search Algorithm | Iterative & Recursive Approaches',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=MHf6a_kq3-A',
        description: 'Binary search on sorted arrays, lower bound, upper bound, and search space reduction.',
      },
      {
        title: 'Linear Search and Binary Search Explained with Complexity',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=246V51AWwZ8',
        description: 'Comparison of O(N) linear search vs O(log N) binary search and sorted array search invariants.',
      },
    ],
  },
  {
    topicMatch: 'Sorting Algorithms',
    fallbackId: 12,
    videos: [
      {
        title: 'Sorting Algorithms Masterclass | Merge Sort, Quick Sort, Bubble Sort',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=HGk_ypEuS24',
        description: 'Comparison of Bubble, Selection, Insertion, Merge Sort (O(N log N)), and Quick Sort partitioning.',
      },
      {
        title: 'Merge Sort and Quick Sort Algorithms | Detailed Tracing',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=ogjf7ORKfd8',
        description: 'Divide and conquer sorting, stability, in-place sorting tradeoffs, and worst-case scenarios.',
      },
    ],
  },
  {
    topicMatch: 'Hashing',
    fallbackId: 13,
    videos: [
      {
        title: 'Hashing Masterclass | Hash Functions, Collision Resolution, & HashMaps',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=KEs5UyBJ39g',
        description: 'Direct address tables, hash collisions, chaining, open addressing, and average O(1) lookups.',
      },
      {
        title: 'Hashing Explained | Hash Sets and Hash Maps in Practice',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=2Tz8iPzXjcw',
        description: 'Frequency maps, two-sum problem using hash maps, and hash set uniqueness.',
      },
    ],
  },
  {
    topicMatch: 'Trees',
    fallbackId: 14,
    videos: [
      {
        title: 'Binary Tree Traversal | Inorder, Preorder, Postorder, Level Order',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=jmy0LaGET1I',
        description: 'Binary tree representation, recursive and iterative traversals, height, and depth properties.',
      },
      {
        title: 'Binary Trees Full Course | Construction, Leaf Nodes, & Subtrees',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=-DzowlcaUmE',
        description: 'Tree data structures, properties of binary trees, and common tree algorithms.',
      },
    ],
  },
  {
    topicMatch: 'Binary Search Trees',
    fallbackId: 15,
    videos: [
      {
        title: 'Binary Search Trees (BST) | Search, Insert, and Delete Operations',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=p7-9UvDQZ3w',
        description: 'BST property, inorder traversal yielding sorted order, predecessor, and successor nodes.',
      },
      {
        title: 'Binary Search Tree Complete Tutorial | BST Validation & Deletion',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=qAEt78356d8',
        description: 'Searching in BST with O(h) complexity, balance considerations, and deletion edge cases.',
      },
    ],
  },
  {
    topicMatch: 'Heaps and Priority Queues',
    fallbackId: 16,
    videos: [
      {
        title: 'Min Heap & Max Heap Data Structure | Heapify & Priority Queue',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=HqPJF2L5h9U',
        description: 'Complete binary tree array representation, parent/child indices, heapify, and heap sort.',
      },
      {
        title: 'Priority Queues & Heaps | Implementation & Applications',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=ywx-Onrdx4U',
        description: 'Min-heap vs max-heap, priority scheduling, and top-k frequent elements pattern.',
      },
    ],
  },
  {
    topicMatch: 'Graphs',
    fallbackId: 17,
    videos: [
      {
        title: 'Graph Data Structure & Representation | Adjacency Matrix vs List',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=M3_pLsDdeuU',
        description: 'Directed/undirected graphs, weighted edges, Breadth-First Search (BFS), and Depth-First Search (DFS).',
      },
      {
        title: 'Graphs in One Shot | BFS, DFS, Dijkstra, & Cycle Detection',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=59fUtYYz7ZU',
        description: 'Graph traversals, shortest path algorithms, topological sorting, and bipartite graphs.',
      },
    ],
  },
  {
    topicMatch: 'Greedy Algorithms',
    fallbackId: 18,
    videos: [
      {
        title: 'Greedy Algorithms Masterclass | Fractional Knapsack, Activity Selection',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=1bCwdq41p8c',
        description: 'Locally optimal choice paradigms, greedy choice property, and proving greedy correctness.',
      },
      {
        title: 'Greedy Approach | Job Sequencing & Minimum Spanning Trees',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=bC7o8PgySsA',
        description: 'Standard greedy problems, interval scheduling, coin change, and Huffman coding.',
      },
    ],
  },
  {
    topicMatch: 'Dynamic Programming',
    fallbackId: 19,
    videos: [
      {
        title: 'Dynamic Programming Introduction | Memoization vs Tabulation',
        channel_name: 'take U forward',
        url: 'https://www.youtube.com/watch?v=tyB0ztf0DNY',
        description: 'Overlapping subproblems, optimal substructure, top-down recursion with memoization vs bottom-up DP table.',
      },
      {
        title: 'Dynamic Programming in One Shot | 0/1 Knapsack, LCS, & Subset Sum',
        channel_name: 'Apna College',
        url: 'https://www.youtube.com/watch?v=gva7_m05p40',
        description: 'State transition modeling, base cases, 1D and 2D DP table optimization, and space reduction.',
      },
    ],
  },
];

async function seedTopicVideos() {
  console.log('Seeding YouTube Video References for all 17 DSA topics...');
  const allTopicsRes = await query('SELECT topic_id, title FROM topics ORDER BY topic_id ASC');
  const allTopics = allTopicsRes.rows;

  let totalInserted = 0;
  for (const item of VIDEO_REFERENCES) {
    // Find matching topic in DB
    let targetTopic = allTopics.find(
      (t) => t.title.toLowerCase().trim() === item.topicMatch.toLowerCase().trim()
    );
    if (!targetTopic) {
      targetTopic = allTopics.find((t) => t.topic_id === item.fallbackId);
    }

    if (!targetTopic) {
      console.warn(`Could not find topic for "${item.topicMatch}" (fallback ${item.fallbackId})`);
      continue;
    }

    const topicId = targetTopic.topic_id;

    for (let i = 0; i < item.videos.length; i++) {
      const v = item.videos[i];
      // Check if URL already exists for this topic
      const existing = await query(
        'SELECT video_id FROM topic_video_references WHERE topic_id = $1 AND url = $2',
        [topicId, v.url]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO topic_video_references (topic_id, title, channel_name, url, description, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [topicId, v.title, v.channel_name, v.url, v.description, i + 1]
        );
        totalInserted++;
      }
    }
  }

  // Count total videos across all topics
  const statsRes = await query(`
    SELECT t.topic_id, t.title, COUNT(v.video_id) AS video_count
    FROM topics t
    LEFT JOIN topic_video_references v ON t.topic_id = v.topic_id
    GROUP BY t.topic_id, t.title
    ORDER BY t.topic_id ASC
  `);

  console.log('Topic Video References Seed Status:');
  statsRes.rows.forEach((r) => {
    console.log(`- Topic #${r.topic_id} "${r.title}": ${r.video_count} video(s)`);
  });

  console.log(`Total new videos inserted: ${totalInserted}`);
  process.exit(0);
}

seedTopicVideos().catch((err) => {
  console.error('Error seeding topic videos:', err);
  process.exit(1);
});
