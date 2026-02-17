# useStatechart

A modern React hook that reads JSON statecharts and gives you type-safe state transitions, with `onEntry`/`onExit` side effects. Built on `useReducer` + `useEffect`. Zero dependencies.

Inspired by [react-automata](https://github.com/MicheleBertoli/react-automata) by Michele Bertoli.

---

## Install

There's nothing to install. Copy `useStatechart.ts` into your project. It's ~80 lines.

---

## Quick Start

```ts
import { useStatechart, type Statechart } from './useStatechart'

const statechart = {
  initial: 'idle',
  states: {
    idle: {
      on: { FETCH: 'loading' },
    },
    loading: {
      on: {
        RESOLVE: 'success',
        REJECT: 'error',
      },
      onEntry: 'startFetch',
    },
    success: {
      on: { RESET: 'idle' },
      onEntry: 'showToast',
    },
    error: {
      on: { RETRY: 'loading', RESET: 'idle' },
      onEntry: 'logError',
    },
  },
} as const satisfies Statechart

function FetchButton() {
  const { state, send, matches, can } = useStatechart(statechart, {
    startFetch: () => api.fetchData(),
    showToast: () => toast.success('Done!'),
    logError: () => console.error('Request failed'),
  })

  return (
    <div>
      <p>Status: {state}</p>
      <button onClick={() => send('FETCH')} disabled={!can('FETCH')}>
        Fetch
      </button>
      {matches('error') && (
        <button onClick={() => send('RETRY')}>Retry</button>
      )}
    </div>
  )
}
```

---

## API

### `useStatechart<TChart>(statechart, actionMap?)`

**Parameters**

| Param        | Type                        | Description                                                                                                                     |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `statechart` | `TChart extends Statechart` | A JSON object defining states, transitions, and lifecycle hooks. Use `as const satisfies Statechart` for full inference.        |
| `actionMap`  | `ActionMap<TChart>`         | Optional. Maps action names (strings in `onEntry`, `onExit`, transition `action`) to functions that receive `(context, event)`. |

**Returns**

| Property  | Type                                                                                    | Description                                                       |
| --------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `state`   | `StateOf<TChart>`                                                                       | The current state name (union of all state keys).                 |
| `context` | `ContextOf<TChart>`                                                                     | Extended state (data that lives alongside the finite state).      |
| `send`    | `(event: EventOf<TChart> \| { type: EventOf<TChart>; [key: string]: unknown }) => void` | Dispatch a transition event. Invalid events are silently ignored. |
| `matches` | `(stateName: StateOf<TChart>) => boolean`                                               | Check if the machine is in a specific state.                      |
| `can`     | `(eventName: EventOf<TChart>) => boolean`                                               | Check if an event is valid from the current state.                |

---

## Statechart Format

```ts
type Statechart = {
  initial: string;
  context?: Record<string, unknown>;
  states: Record<
    string,
    {
      on?: Record<string, string | { target: string; action?: string }>;
      onEntry?: string;
      onExit?: string;
    }
  >;
};
```

### Getting full type inference

Use `as const satisfies Statechart` on your chart definition. This gives you autocomplete on `send()` and `matches()`, and type errors on misspelled states or events.

```ts
import type { Statechart } from "./useStatechart";

const chart = {
  initial: "idle",
  states: {
    idle: { on: { FETCH: "loading" } },
    loading: { on: { RESOLVE: "done" } },
    done: {},
  },
} as const satisfies Statechart;

const { send, matches } = useStatechart(chart, {});

send("FETCH"); // ✅
send("NOPE"); // ❌ type error
matches("idle"); // ✅
matches("nope"); // ❌ type error
```

---

## Features

### Invalid transitions are blocked

If you `send()` an event with no transition defined in the current state, nothing happens. The state doesn't change. A `console.warn` is logged in development.

```ts
// state is 'idle', only FETCH is defined
send("RESOLVE"); // → no-op, state stays 'idle'
```

### onEntry / onExit lifecycle hooks

Define side effects that fire when a state is entered or exited.

```ts
const chart = {
  initial: "off",
  states: {
    off: {
      on: { TOGGLE: "on" },
      onExit: "cleanup",
    },
    on: {
      on: { TOGGLE: "off" },
      onEntry: "startPolling",
      onExit: "stopPolling",
    },
  },
} as const satisfies Statechart;

useStatechart(chart, {
  startPolling: () => {
    /* ... */
  },
  stopPolling: () => {
    /* ... */
  },
  cleanup: () => {
    /* ... */
  },
});
```

The initial state's `onEntry` fires on mount.

### Transition actions

For logic that should run during a specific transition (not every time a state is entered), use the object form:

```ts
const chart = {
  initial: "idle",
  context: { query: "" },
  states: {
    idle: {
      on: {
        FETCH: {
          target: "loading",
          action: "setQueryParams",
        },
      },
    },
    loading: {
      on: { RESOLVE: "idle" },
    },
  },
} as const satisfies Statechart;

useStatechart(chart, {
  setQueryParams: (ctx, event) => ({
    ...ctx,
    query: (event as { type: string; payload: string }).payload,
  }),
});
```

The action receives `(context, event)` and can return a new context object.

### Extended state (context)

For data that changes alongside the finite state, use `context`:

```ts
const chart = {
  initial: "idle",
  context: { retries: 0 },
  states: {
    idle: { on: { FETCH: "loading" } },
    loading: { on: { REJECT: "error" } },
    error: {
      on: {
        RETRY: { target: "loading", action: "incrementRetry" },
      },
    },
  },
} as const satisfies Statechart;

const { context } = useStatechart(chart, {
  incrementRetry: (ctx) => ({ ...ctx, retries: ctx.retries + 1 }),
});

console.log(context.retries); // tracks across transitions
```

Here's an example with a form input that updates context directly:

```ts
import { useStatechart } from './useStatechart'
import type { Statechart } from './useStatechart'

const statechart = {
  initial: 'idle',
  context: { retries: 0, error: null as string | null, url: '' },
  states: {
    idle: {
      on: {
        SET_URL: { target: 'idle', action: 'updateUrl' },
        FETCH: 'loading',
      },
    },
    loading: {
      on: {
        RESOLVE: 'success',
        REJECT: 'error',
      },
      onEntry: 'startFetch',
    },
    success: {
      on: { RESET: 'idle' },
      onEntry: 'showToast',
    },
    error: {
      on: {
        RETRY: { target: 'loading', action: 'incrementRetry' },
        RESET: 'idle',
      },
      onEntry: 'logError',
    },
  },
} as const satisfies Statechart

function FetchButton() {
  const { state, context, send, matches, can } = useStatechart(statechart, {
    updateUrl: (ctx, event) => ({ ...ctx, url: (event as any).value }),
    startFetch: (ctx) => api.fetchData(ctx.url),
    showToast: () => toast.success('Done!'),
    logError: (ctx) => console.error(`Request failed (attempt ${ctx.retries})`),
    incrementRetry: (ctx) => ({ ...ctx, retries: ctx.retries + 1 }),
  })

  return (
    <div>
      <p>Status: {state}</p>

      <input
        value={context.url}
        onChange={(e) => send({ type: 'SET_URL', value: e.target.value })}
        placeholder="Enter URL"
      />

      <button onClick={() => send('FETCH')} disabled={!can('FETCH')}>
        Fetch
      </button>

      {matches('error') && (
        <div>
          <p>Retries: {context.retries}</p>
          <button onClick={() => send('RETRY')}>Retry</button>
        </div>
      )}
    </div>
  )
}
```

The key pattern is the self-transition — `idle` → `idle` with an action. The `send({ type: 'SET_URL', value: '...' })` object form lets you pass arbitrary payload alongside the event, and the transition action picks it off to update context.

### `can()` for conditional UI

```tsx
<button onClick={() => send("SUBMIT")} disabled={!can("SUBMIT")}>
  Submit
</button>
```

`can` checks whether an event would actually do anything from the current state.

It looks at the statechart JSON, finds the current state's `on` map, and returns `true` if the event name exists there — meaning there's a valid transition defined for it.

So if your chart looks like this:

```ts
states: {
  idle:    { on: { FETCH: 'loading' } },
  loading: { on: { RESOLVE: 'success', REJECT: 'error' } },
  success: {},
}
```

And you're in `idle`:

```ts
can("FETCH"); // true  — idle defines a FETCH transition
can("RESOLVE"); // false — idle has no RESOLVE transition
can("RANDOM"); // false — doesn't exist anywhere in idle
```

If you then transition to `loading`:

```ts
can("FETCH"); // false — loading doesn't define FETCH
can("RESOLVE"); // true  — loading defines RESOLVE
```

The main use is disabling buttons. Instead of manually tracking "am I in a state where submit makes sense", you just ask the machine:

```tsx
<button disabled={!can("SUBMIT")}>Submit</button>
```

It's the same thing `send` does internally before transitioning — `can` just exposes that check without actually dispatching anything.

### `matches()` for conditional rendering

```tsx
{
  matches("loading") && <Spinner />;
}
{
  matches("error") && <ErrorBanner />;
}
```

---

## Patterns

### Fetch with loading/error states

```ts
const fetchChart = {
  initial: "idle",
  context: { data: null as unknown, error: null as string | null },
  states: {
    idle: { on: { FETCH: "loading" } },
    loading: {
      on: { RESOLVE: "success", REJECT: "error" },
      onEntry: "doFetch",
    },
    success: { on: { FETCH: "loading" } },
    error: { on: { RETRY: "loading" } },
  },
} as const satisfies Statechart;
```

### Toggle

```ts
const toggleChart = {
  initial: "off",
  states: {
    off: { on: { TOGGLE: "on" } },
    on: { on: { TOGGLE: "off" } },
  },
} as const satisfies Statechart;
```

### Multi-step form / wizard

```ts
const wizardChart = {
  initial: "step1",
  states: {
    step1: { on: { NEXT: "step2" } },
    step2: { on: { NEXT: "step3", BACK: "step1" } },
    step3: { on: { NEXT: "review", BACK: "step2" } },
    review: { on: { SUBMIT: "submitted", BACK: "step3" } },
    submitted: {},
  },
} as const satisfies Statechart;
```

### Auth flow

```ts
const authChart = {
  initial: "loggedOut",
  states: {
    loggedOut: { on: { LOGIN: "authenticating" } },
    authenticating: {
      on: { SUCCESS: "loggedIn", FAIL: "loggedOut" },
      onEntry: "authenticate",
    },
    loggedIn: {
      on: { LOGOUT: "loggedOut" },
      onEntry: "loadProfile",
      onExit: "clearSession",
    },
  },
} as const satisfies Statechart;
```

---

## How it works

Three pieces from React, composed:

1. **`useReducer`** — The reducer reads the statechart JSON, looks up the current state's `on` map, and either transitions to the target state or returns the current state unchanged (blocking invalid transitions).

2. **`useEffect`** on `state.currentState` — When the state changes, it fires `onExit` for the previous state and `onEntry` for the new state, using a ref to track the previous state.

3. **A mount `useEffect`** — Fires `onEntry` for the initial state on first render.

That's it. No interpreters, no services, no subscriptions.

---

## JSON statecharts → useReducer + useEffect. Type-safe transitions, onEntry/onExit hooks, zero dependencies.

This doesn't aim to replace xstate. If you need parallel states, history states, guards, delayed transitions, or actors — use xstate. This is for when your state logic fits in a JSON object and you want something you can read in 60 seconds.

---

## License

MIT. Do whatever you want with it.
