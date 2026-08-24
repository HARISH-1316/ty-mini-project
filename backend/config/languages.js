// ──────────────────────────────────────────────
// Centralized Supported Language Configuration
// ──────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = {
  c: {
    language: 'c',
    name: 'C',
    dockerImage: 'gcc:14',
    sourceFile: 'main.c',
    compileCommand: ['gcc', 'main.c', '-O2', '-std=c17', '-o', 'main'],
    runCommand: ['./main'],
    monacoLanguage: 'c',
    defaultTemplate: `#include <stdio.h>

int main() {
    // Read input and produce output
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%d\\n", n);
    }
    return 0;
}
`,
  },
  cpp: {
    language: 'cpp',
    name: 'C++',
    dockerImage: 'gcc:14',
    sourceFile: 'main.cpp',
    compileCommand: ['g++', 'main.cpp', '-O2', '-std=c++17', '-o', 'main'],
    runCommand: ['./main'],
    monacoLanguage: 'cpp',
    defaultTemplate: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        cout << n << "\\n";
    }

    return 0;
}
`,
  },
  java: {
    language: 'java',
    name: 'Java',
    dockerImage: 'eclipse-temurin:21',
    sourceFile: 'Main.java',
    compileCommand: ['javac', 'Main.java'],
    runCommand: ['java', 'Main'],
    monacoLanguage: 'java',
    defaultTemplate: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int n = scanner.nextInt();
            System.out.println(n);
        }
    }
}
`,
  },
  python: {
    language: 'python',
    name: 'Python',
    dockerImage: 'python:3.12',
    sourceFile: 'main.py',
    compileCommand: null,
    runCommand: ['python', 'main.py'],
    monacoLanguage: 'python',
    defaultTemplate: `import sys

def main():
    lines = sys.stdin.read().split()
    if lines:
        print(lines[0])

if __name__ == '__main__':
    main()
`,
  },
};

export const getLanguageConfig = (lang) => {
  if (!lang) return null;
  const normalized = lang.toLowerCase().trim();
  if (normalized === 'c++') return SUPPORTED_LANGUAGES.cpp;
  if (normalized === 'py') return SUPPORTED_LANGUAGES.python;
  return SUPPORTED_LANGUAGES[normalized] || null;
};
