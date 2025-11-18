/**
 * Mapeamento de linguagens do backend (slug/name) para IDs do Judge0
 * Baseado na estrutura do frontend web
 */

export interface Language {
  id: string;
  name: string;
  slug: string;
}

/**
 * IDs do Judge0 API
 * Referência: https://ce.judge0.com/languages
 */
export const JUDGE0_LANGUAGE_IDS = {
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
 * Mapeamento de slugs/nomes de linguagens para IDs do Judge0
 */
const LANGUAGE_SLUG_TO_JUDGE0_ID: Record<string, number> = {
  // C
  'c': JUDGE0_LANGUAGE_IDS.C,
  'c-lang': JUDGE0_LANGUAGE_IDS.C,
  
  // C++
  'cpp': JUDGE0_LANGUAGE_IDS.CPP,
  'c++': JUDGE0_LANGUAGE_IDS.CPP,
  'cplusplus': JUDGE0_LANGUAGE_IDS.CPP,
  
  // Java
  'java': JUDGE0_LANGUAGE_IDS.JAVA,
  
  // Python
  'python': JUDGE0_LANGUAGE_IDS.PYTHON,
  'py': JUDGE0_LANGUAGE_IDS.PYTHON,
  
  // JavaScript
  'javascript': JUDGE0_LANGUAGE_IDS.JAVASCRIPT,
  'js': JUDGE0_LANGUAGE_IDS.JAVASCRIPT,
  'node': JUDGE0_LANGUAGE_IDS.JAVASCRIPT,
  
  // TypeScript
  'typescript': JUDGE0_LANGUAGE_IDS.TYPESCRIPT,
  'ts': JUDGE0_LANGUAGE_IDS.TYPESCRIPT,
  
  // Bash/Shell
  'bash': JUDGE0_LANGUAGE_IDS.BASH,
  'shell': JUDGE0_LANGUAGE_IDS.BASH,
  'sh': JUDGE0_LANGUAGE_IDS.BASH,
  
  // C#
  'csharp': JUDGE0_LANGUAGE_IDS.CSHARP,
  'c#': JUDGE0_LANGUAGE_IDS.CSHARP,
  'cs': JUDGE0_LANGUAGE_IDS.CSHARP,
  
  // Go
  'go': JUDGE0_LANGUAGE_IDS.GO,
  'golang': JUDGE0_LANGUAGE_IDS.GO,
  
  // Rust
  'rust': JUDGE0_LANGUAGE_IDS.RUST,
  'rs': JUDGE0_LANGUAGE_IDS.RUST,
  
  // PHP
  'php': JUDGE0_LANGUAGE_IDS.PHP,
  
  // Ruby
  'ruby': JUDGE0_LANGUAGE_IDS.RUBY,
  'rb': JUDGE0_LANGUAGE_IDS.RUBY,
  
  // Swift
  'swift': JUDGE0_LANGUAGE_IDS.SWIFT,
  
  // Kotlin
  'kotlin': JUDGE0_LANGUAGE_IDS.KOTLIN,
  'kt': JUDGE0_LANGUAGE_IDS.KOTLIN,
  
  // Scala
  'scala': JUDGE0_LANGUAGE_IDS.SCALA,
};

/**
 * Mapeamento de nomes de linguagens para IDs do Judge0
 */
const LANGUAGE_NAME_TO_JUDGE0_ID: Record<string, number> = {
  'c': JUDGE0_LANGUAGE_IDS.C,
  'c++': JUDGE0_LANGUAGE_IDS.CPP,
  'cpp': JUDGE0_LANGUAGE_IDS.CPP,
  'java': JUDGE0_LANGUAGE_IDS.JAVA,
  'python': JUDGE0_LANGUAGE_IDS.PYTHON,
  'javascript': JUDGE0_LANGUAGE_IDS.JAVASCRIPT,
  'typescript': JUDGE0_LANGUAGE_IDS.TYPESCRIPT,
  'bash': JUDGE0_LANGUAGE_IDS.BASH,
  'shell': JUDGE0_LANGUAGE_IDS.BASH,
  'c#': JUDGE0_LANGUAGE_IDS.CSHARP,
  'csharp': JUDGE0_LANGUAGE_IDS.CSHARP,
  'go': JUDGE0_LANGUAGE_IDS.GO,
  'rust': JUDGE0_LANGUAGE_IDS.RUST,
  'php': JUDGE0_LANGUAGE_IDS.PHP,
  'ruby': JUDGE0_LANGUAGE_IDS.RUBY,
  'swift': JUDGE0_LANGUAGE_IDS.SWIFT,
  'kotlin': JUDGE0_LANGUAGE_IDS.KOTLIN,
  'scala': JUDGE0_LANGUAGE_IDS.SCALA,
};

/**
 * Templates de código padrão para cada linguagem
 */
export const CODE_TEMPLATES: Record<number, string> = {
  [JUDGE0_LANGUAGE_IDS.C]: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Seu código aqui
    printf("Hello, World!\\n");
    return 0;
}`,
  [JUDGE0_LANGUAGE_IDS.CPP]: `#include <iostream>
using namespace std;

int main() {
    // Seu código aqui
    cout << "Hello, World!" << endl;
    return 0;
}`,
  [JUDGE0_LANGUAGE_IDS.JAVA]: `public class Main {
    public static void main(String[] args) {
        // Seu código aqui
        System.out.println("Hello, World!");
    }
}`,
  [JUDGE0_LANGUAGE_IDS.BASH]: `#!/bin/bash

# Seu código aqui
echo "Hello, World!"`,
  [JUDGE0_LANGUAGE_IDS.PYTHON]: `# Seu código aqui
print("Hello, World!")`,
  [JUDGE0_LANGUAGE_IDS.JAVASCRIPT]: `// Seu código aqui
console.log("Hello, World!");`,
  [JUDGE0_LANGUAGE_IDS.TYPESCRIPT]: `// Seu código aqui
console.log("Hello, World!");`,
  [JUDGE0_LANGUAGE_IDS.CSHARP]: `using System;

class Program {
    static void Main() {
        // Seu código aqui
        Console.WriteLine("Hello, World!");
    }
}`,
  [JUDGE0_LANGUAGE_IDS.GO]: `package main

import "fmt"

func main() {
    // Seu código aqui
    fmt.Println("Hello, World!")
}`,
  [JUDGE0_LANGUAGE_IDS.RUST]: `fn main() {
    // Seu código aqui
    println!("Hello, World!");
}`,
  [JUDGE0_LANGUAGE_IDS.PHP]: `<?php
// Seu código aqui
echo "Hello, World!";
?>`,
  [JUDGE0_LANGUAGE_IDS.RUBY]: `# Seu código aqui
puts "Hello, World!"`,
};

/**
 * Converter languageId (string do backend) ou objeto Language para ID do Judge0
 * 
 * @param languageId - ID da linguagem do backend (string)
 * @param language - Objeto Language com name e slug
 * @returns ID numérico do Judge0 ou null se não encontrado
 */
export function getJudge0LanguageId(
  languageId?: string | null,
  language?: Language | null
): number | null {
  // Se temos um objeto language, usar slug ou name
  if (language) {
    const slugLower = language.slug?.toLowerCase();
    const nameLower = language.name?.toLowerCase();
    
    if (slugLower && LANGUAGE_SLUG_TO_JUDGE0_ID[slugLower]) {
      return LANGUAGE_SLUG_TO_JUDGE0_ID[slugLower];
    }
    
    if (nameLower && LANGUAGE_NAME_TO_JUDGE0_ID[nameLower]) {
      return LANGUAGE_NAME_TO_JUDGE0_ID[nameLower];
    }
  }
  
  // Se temos apenas languageId (string), tentar buscar a linguagem pelo ID
  // Por enquanto, retornar null e deixar o componente buscar a linguagem
  // ou usar um padrão
  return null;
}

/**
 * Obter ID do Judge0 a partir de um exercício
 * Tenta usar languageId, language.slug, language.name ou fallback para Java
 */
export function getJudge0LanguageIdFromExercise(exercise: {
  languageId?: string | null;
  language?: Language | null;
}): number {
  const judge0Id = getJudge0LanguageId(exercise.languageId, exercise.language);
  
  // Se não encontrou, usar Java como padrão (compatibilidade com frontend web)
  return judge0Id || JUDGE0_LANGUAGE_IDS.JAVA;
}

/**
 * Obter template padrão para uma linguagem
 */
export function getDefaultTemplate(judge0LanguageId: number): string {
  return CODE_TEMPLATES[judge0LanguageId] || '// start coding...';
}

/**
 * Obter template padrão a partir de um exercício
 */
export function getDefaultTemplateFromExercise(exercise: {
  languageId?: string | null;
  language?: Language | null;
  codeTemplate?: string | null;
}): string {
  // Se já tem template, usar ele
  if (exercise.codeTemplate) {
    return exercise.codeTemplate;
  }
  
  // Caso contrário, gerar template baseado na linguagem
  const judge0Id = getJudge0LanguageIdFromExercise(exercise);
  return getDefaultTemplate(judge0Id);
}

