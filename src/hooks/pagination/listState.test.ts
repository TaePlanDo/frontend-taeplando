import { describe, expect, it } from "vitest";

import {
  getPaginatedListState,
  hasDisplayableListData,
  type PaginatedListState,
} from "./listState";

describe("getPaginatedListState", () => {
  it.each<{
    name: string;
    input: Parameters<typeof getPaginatedListState>[0];
    expected: PaginatedListState;
  }>([
    {
      name: "an initial offline request",
      input: {
        hasData: false,
        isOnline: false,
        isLoading: false,
        isError: false,
        isEmpty: false,
      },
      expected: { kind: "unavailable", reason: "offline" },
    },
    {
      name: "an initial request error",
      input: {
        hasData: false,
        isOnline: true,
        isLoading: false,
        isError: true,
        isEmpty: false,
      },
      expected: { kind: "unavailable", reason: "error" },
    },
    {
      name: "a loading request",
      input: {
        hasData: false,
        isOnline: true,
        isLoading: true,
        isError: false,
        isEmpty: false,
      },
      expected: { kind: "loading", hasData: false },
    },
    {
      name: "an empty response",
      input: {
        hasData: true,
        isOnline: true,
        isLoading: false,
        isError: false,
        isEmpty: true,
      },
      expected: { kind: "empty" },
    },
    {
      name: "offline cached data",
      input: {
        hasData: true,
        isOnline: false,
        isLoading: false,
        isError: false,
        isEmpty: false,
      },
      expected: { kind: "stale", reason: "offline", isEmpty: false },
    },
    {
      name: "cached empty data after an error",
      input: {
        hasData: true,
        isOnline: true,
        isLoading: false,
        isError: true,
        isEmpty: true,
      },
      expected: { kind: "stale", reason: "error", isEmpty: true },
    },
    {
      name: "a ready list",
      input: {
        hasData: true,
        isOnline: true,
        isLoading: false,
        isError: false,
        isEmpty: false,
      },
      expected: { kind: "ready" },
    },
  ])("returns $expected for $name", ({ input, expected }) => {
    expect(getPaginatedListState(input)).toEqual(expected);
  });
});

describe("hasDisplayableListData", () => {
  it.each<{
    state: PaginatedListState;
    expected: boolean;
  }>([
    { state: { kind: "loading", hasData: false }, expected: false },
    { state: { kind: "loading", hasData: true }, expected: true },
    {
      state: { kind: "unavailable", reason: "error" },
      expected: false,
    },
    { state: { kind: "empty" }, expected: true },
    {
      state: { kind: "stale", reason: "offline", isEmpty: false },
      expected: true,
    },
    { state: { kind: "ready" }, expected: true },
  ])("returns $expected for $state.kind", ({ state, expected }) => {
    expect(hasDisplayableListData(state)).toBe(expected);
  });
});
