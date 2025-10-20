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
npx tsx src/recursiveMonad/recursiveMonad.ts
npx tsx src/cleanArchitecture/cleanArchitecture.ts
npx tsx src/keyedPromiseAll/keyedPromiseAllv2.ts
npx tsx src/typeCalc/typeTest.ts
npx tsx src/mappedType/mappedType.ts
npx tsx src/distributiveConditionalType/distributiveConditionalType.ts
npx tsx src/caFramework/sandbox.ts

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

### 🔄 [Recursive Monad](src/recursiveMonad/)
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

### 🍎 [Mapped Types with Fruits](src/mappedType/mappedType.ts)
Learn Mapped Types through a fun fruit-themed tutorial.
- Step-by-step explanation from Record to Mapped Types
- Understanding `as const` and type widening
- Transforming types (arrays, functions with arguments)
- Practical pattern: function table with type constraints

### 🔀 [Distributive Conditional Types](src/distributiveConditionalType/distributiveConditionalType.ts)
Deep dive into how TypeScript distributes union types in conditional types.
- How `T extends U` distributes over unions
- Preventing distribution with `[T]` wrapper
- Implementing Extract and Exclude from scratch
- Boolean literal expansion behavior

### 🏛️ [CA Framework Sandbox](src/caFramework/sandbox.ts)
Type-level enforcement of Clean Architecture dependency rules.
- Layer dependency validation at compile-time
- InterfacePolicy for declaring allowed consumers
- LayerPolicy for bidirectional dependency checking
- Architectural constraints as TypeScript types

### ❌ [Keyed Promise.all v1](src/keyedPromiseAll/keyedPromiseAll.ts) - Failed Attempt
Enhanced Promise.all that returns results by meaningful keys instead of array indices.
- **Type inference issues**: Function types get reduced to constraints
- Kept as a learning example of TypeScript's limitations

### ✅ [Keyed Promise.all v2](src/keyedPromiseAll/keyedPromiseAllv2.ts)
Improved version with perfect type inference using class-based wrapping.
- **Builder pattern** for fluent API design
- **Perfect type inference** through KeyedFunc wrapper class
- Result type pattern for type-safe error handling
- handleResult helper for convenient result processing

---

## 🪶 License
Licensed under the [MIT License](./LICENSE).  
Free to learn, remix, and build upon.