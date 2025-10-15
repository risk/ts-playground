# 🧩 TS Playground

TypeScript experiments and architecture sketches by **risk**.  
Code featured in my [Zenn articles](https://zenn.dev/risk).

---

💡 This repository contains small TypeScript experiments,  
design pattern trials, and clean architecture prototypes, etc.

Each directory or file is mostly self-contained —  
feel free to explore any of them.

> _Playground means: you can break it, fix it, or rebuild it — that's the point._ 🎈

---

## 🚀 Getting Started

### Setup
```bash
# Clone the repository
git clone https://github.com/risk/ts-playground.git
cd ts-playground

# Install dependencies
npm install
```

### Run Examples
```bash
# Run any TypeScript file directly with tsx
npx tsx src/pipeline/pipeline.ts
npx tsx src/recursiveMonado/recursiveMonado.ts
npx tsx src/cleanArchitecture/cleanArchitecture.ts
npx tsx src/keyedPromiseAll/keyedPromiseAll.ts
npx tsx src/typeCalc/typeTest.ts

# Or compile and run
npm run build
node dist/pipeline/pipeline.js
```

## 📚 Projects

> _These descriptions were written by Cursor AI._ 🤖

### 🔗 [Type-safe Pipeline](src/typesafe-pipeline/)
Railway Oriented Programming with full type safety.
- Error recovery mechanisms
- Composable pipeline structure
- Zero runtime overhead

### 🔄 [Recursive Monad](src/recursiveMonado/)
Converting recursion into a chain structure to avoid stack overflow.
- Bidirectional linked list
- Generator-based lazy evaluation
- Applicable to tree/graph traversal

### 🏗️ [Clean Architecture](src/cleanArchitecture/)
Sample implementation of Clean Architecture pattern.
- Layer separation (Entity, UseCase, Gateway, Presenter)
- Dependency injection
- Result type pattern

### 🔢 [Type-level Arithmetic](src/typeCalc/typeCalc.ts)
Four arithmetic operations implemented at the type level.
- Addition, subtraction, multiplication, division
- Numbers represented as array lengths
- Pure type-level computation with zero runtime cost

### 📖 [Type System Learning](src/typeCalc/typeTest.ts)
Educational examples for understanding TypeScript's type system.
- `extends` and `infer` keyword usage
- Deconstructing function types with Parameters and ReturnType
- Array pattern matching with conditional types

### 🔑 [Keyed Promise.all](src/keyedPromiseAll/)
Enhanced Promise.all that returns results by meaningful keys instead of array indices.
- Result type pattern for type-safe error handling
- Arguments type inference for each function
- Composable and nestable structure

---

## 🪶 License
Licensed under the [MIT License](./LICENSE).  
Free to learn, remix, and build upon.