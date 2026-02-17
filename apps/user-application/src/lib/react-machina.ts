import { useCallback, useReducer } from "react";

// ── Types ──────────────────────────────────────────────

export type Statechart = {
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

/** Union of state name keys from a chart. */
export type StateOf<T extends Statechart> = Extract<keyof T["states"], string>;

/** Union of event name keys from a chart. */
export type EventOf<T extends Statechart> = {
	[S in keyof T["states"]]: T["states"][S] extends { on?: infer O }
		? O extends Record<string, unknown>
			? Extract<keyof O, string>
			: never
		: never;
}[keyof T["states"]];

/** Union of all action name strings from a chart (onEntry, onExit, transition actions). */
type ActionNamesOf<T extends Statechart> =
	| {
			[S in keyof T["states"]]: T["states"][S] extends { onEntry?: infer E }
				? E extends string
					? E
					: never
				: never;
	  }[keyof T["states"]]
	| {
			[S in keyof T["states"]]: T["states"][S] extends { onExit?: infer E }
				? E extends string
					? E
					: never
				: never;
	  }[keyof T["states"]]
	| {
			[S in keyof T["states"]]: T["states"][S] extends { on?: infer O }
				? O extends Record<string, unknown>
					? {
							[K in keyof O]: O[K] extends { action?: infer A }
								? A extends string
									? A
									: never
								: never;
						}[keyof O]
					: never
				: never;
	  }[keyof T["states"]];

type ContextOf<T extends Statechart> = T extends { context: infer C }
	? C
	: Record<string, unknown>;

export type ActionMap<T extends Statechart> = Partial<
	Record<
		ActionNamesOf<T>,
		(
			ctx: ContextOf<T>,
			event: { type: EventOf<T>; [key: string]: any },
		) => ContextOf<T> | void
	>
>;

type MachineState<T extends Statechart> = {
	currentState: StateOf<T>;
	prevState: StateOf<T> | null;
	context: ContextOf<T>;
};

type MachineEvent<T extends Statechart> =
	| EventOf<T>
	| { type: EventOf<T>; [key: string]: unknown };

// ── Hook ───────────────────────────────────────────────

export function useMachina<T extends Statechart>(
	statechart: T,
	actionMap: ActionMap<T> = {} as ActionMap<T>,
) {
	type S = StateOf<T>;
	type E = EventOf<T>;

	const initialState: MachineState<T> = {
		currentState: statechart.initial as S,
		prevState: null,
		context: (statechart.context ?? {}) as ContextOf<T>,
	};

	function reducer(
		state: MachineState<T>,
		event: MachineEvent<T>,
	): MachineState<T> {
		const eventName = (
			typeof event === "string" ? event : event.type
		) as string;
		const stateNode = statechart.states[state.currentState];
		if (!stateNode?.on?.[eventName]) {
			console.warn(
				`[statechart] Invalid transition: "${eventName}" from "${state.currentState}"`,
			);
			return state;
		}

		const target = stateNode.on[eventName];
		const nextStateName = (
			typeof target === "string" ? target : target.target
		) as S;
		if (!statechart.states[nextStateName]) {
			console.warn(`[statechart] Unknown target state: "${nextStateName}"`);
			return state;
		}

		let nextContext = { ...state.context };
		const eventPayload = event as { type: E; [key: string]: unknown };

		// onExit current state
		if (stateNode?.onExit) {
			const fn = actionMap[stateNode.onExit as ActionNamesOf<T>];
			if (fn) {
				const result = fn(nextContext, eventPayload);
				if (result) nextContext = result;
			}
		}

		// transition action
		if (typeof target === "object" && target.action) {
			const fn = actionMap[target.action as ActionNamesOf<T>];
			if (fn) {
				const result = fn(nextContext, eventPayload);
				if (result) nextContext = result;
			}
		}

		// onEntry next state
		const nextStateNode = statechart.states[nextStateName];
		if (nextStateNode?.onEntry) {
			const fn = actionMap[nextStateNode.onEntry as ActionNamesOf<T>];
			if (fn) {
				const result = fn(nextContext, eventPayload);
				if (result) nextContext = result;
			}
		}

		return {
			currentState: nextStateName,
			prevState: state.currentState,
			context: nextContext,
		};
	}

	const [state, dispatch] = useReducer(reducer, initialState);

	const send = useCallback((event: MachineEvent<T>) => dispatch(event), []);
	const matches = useCallback(
		(s: S) => state.currentState === s,
		[state.currentState],
	);
	const can = useCallback(
		(e: E) => !!statechart.states[state.currentState]?.on?.[e as ActionNamesOf<T>],
		[state.currentState],
	);

	return {
		state: state.currentState,
		context: state.context,
		send,
		matches,
		can,
	};
}
