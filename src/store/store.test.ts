import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { store } from "./store.ts";

describe("redux store", () => {
  it("initializes with an empty state", () => {
    assert.deepEqual(store.getState(), {});
  });

  it("leaves the placeholder state unchanged when no slice handles the action", () => {
    const before = store.getState();

    store.dispatch({ type: "livingspace/unknown" });

    assert.deepEqual(store.getState(), before);
  });

  it("updates state when a reducer handles the dispatched action", () => {
    const counterSlice = createSlice({
      name: "counter",
      initialState: { value: 0 },
      reducers: {
        increment(state) {
          state.value += 1;
        },
      },
    });
    const testStore = configureStore({
      reducer: { counter: counterSlice.reducer },
    });

    testStore.dispatch(counterSlice.actions.increment());

    assert.equal(testStore.getState().counter.value, 1);
  });
});
