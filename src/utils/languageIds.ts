/**
 * IDs de linguagens do Judge0 API
 * Referência: https://ce.judge0.com/languages
 */
export const LANGUAGE_IDS = {
  // Linguagens principais
  C: 50,              // C (GCC 9.2.0)
  CPP: 54,            // C++ (GCC 9.2.0)
  JAVA: 62,           // Java (OpenJDK 13.0.1)
  PYTHON: 71,         // Python (3.8.1)
  JAVASCRIPT: 63,     // JavaScript (Node.js 12.14.0)
  TYPESCRIPT: 74,     // TypeScript (3.7.4)
  BASH: 46,           // Bash (5.0.0)
  SHELL: 46,          // Shell (Bash 5.0.0) - mesmo ID do Bash
  CSHARP: 51,         // C# (Mono 6.6.0.161)
  GO: 60,             // Go (1.13.5)
  RUST: 73,           // Rust (1.40.0)
  PHP: 68,            // PHP (7.4.1)
  RUBY: 72,           // Ruby (2.7.0)
  SWIFT: 83,          // Swift (5.2.3)
  KOTLIN: 78,         // Kotlin (1.3.70)
  SCALA: 81,          // Scala (2.13.2)
} as const;

/**
 * Templates de código padrão para cada linguagem
 */
export const CODE_TEMPLATES: Record<number, string> = {
  [LANGUAGE_IDS.C]: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Seu código aqui
    printf("Hello, World!\\n");
    return 0;
}`,
  [LANGUAGE_IDS.CPP]: `#include <iostream>
using namespace std;

int main() {
    // Seu código aqui
    cout << "Hello, World!" << endl;
    return 0;
}`,
  [LANGUAGE_IDS.JAVA]: `public class Main {
    public static void main(String[] args) {
        // Seu código aqui
        System.out.println("Hello, World!");
    }
}`,
  [LANGUAGE_IDS.BASH]: `#!/bin/bash

# Seu código aqui
echo "Hello, World!"`,
  [LANGUAGE_IDS.PYTHON]: `# Seu código aqui
print("Hello, World!")`,
  [LANGUAGE_IDS.JAVASCRIPT]: `// Seu código aqui
console.log("Hello, World!");`,
};

/**
 * Obter template padrão para uma linguagem
 */
export function getDefaultTemplate(languageId: number): string {
  return CODE_TEMPLATES[languageId] || '// start coding...';
}

/**
 * Obter nome da linguagem pelo ID
 */
export function getLanguageName(languageId: number): string {
  const entries = Object.entries(LANGUAGE_IDS);
  const entry = entries.find(([_, id]) => id === languageId);
  return entry ? entry[0] : 'Unknown';
}

/**
 * Verificar se uma linguagem é compilada (C, C++, Java, etc)
 */
export function isCompiledLanguage(languageId: number): boolean {
  return [
    LANGUAGE_IDS.C,
    LANGUAGE_IDS.CPP,
    LANGUAGE_IDS.JAVA,
    LANGUAGE_IDS.CSHARP,
    LANGUAGE_IDS.GO,
    LANGUAGE_IDS.RUST,
  ].includes(languageId);
}

/**
 * Verificar se uma linguagem é script (Bash, Python, JavaScript, etc)
 */
export function isScriptLanguage(languageId: number): boolean {
  return [
    LANGUAGE_IDS.BASH,
    LANGUAGE_IDS.SHELL,
    LANGUAGE_IDS.PYTHON,
    LANGUAGE_IDS.JAVASCRIPT,
    LANGUAGE_IDS.PHP,
    LANGUAGE_IDS.RUBY,
  ].includes(languageId);
}

