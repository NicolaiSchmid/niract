# Niract

A tiny React-like framework built from scratch for learning purposes.

## What is this?

Niract is a minimal implementation of React's core concepts — virtual DOM, rendering, reconciliation, hooks, and Solid-style signals — built step by step to understand how modern UI frameworks work under the hood.

## Phases

| Phase | Topic | Tests | Status |
|-------|-------|-------|--------|
| 1 | `createElement` — Virtual DOM factory | 8 | Done |
| 2 | `render` — DOM rendering | 7 | TODO |
| 3 | `reconcile` — Diffing & patching | 7 | TODO |
| 4 | `useState` / `useEffect` — Hooks | 7 | TODO |
| 5 | `createSignal` / `createEffect` / `createMemo` — Signals | 11 | TODO |

## Getting started

```bash
npm install
npm run test:run
```

## Running a specific phase

```bash
npx vitest run tests/01-create-element.test.js
```

## License

MIT
