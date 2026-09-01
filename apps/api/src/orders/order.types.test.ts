import { describe, it, expect } from "vitest";
import { canTransition, ORDER_TRANSITIONS } from "./domain/order.types.js";

describe("ORDER_TRANSITIONS", () => {
  it("NUEVO can transition to CONFIRMADO and CANCELADO", () => {
    expect(ORDER_TRANSITIONS.NUEVO).toEqual(["CONFIRMADO", "CANCELADO"]);
  });

  it("ENTREGADO is terminal (no transitions)", () => {
    expect(ORDER_TRANSITIONS.ENTREGADO).toEqual([]);
  });

  it("CANCELADO is terminal (no transitions)", () => {
    expect(ORDER_TRANSITIONS.CANCELADO).toEqual([]);
  });

  it("EN_CAMINO can only go to ENTREGADO", () => {
    expect(ORDER_TRANSITIONS.EN_CAMINO).toEqual(["ENTREGADO"]);
  });
});

describe("canTransition", () => {
  it("allows NUEVO → CONFIRMADO", () => {
    expect(canTransition("NUEVO", "CONFIRMADO")).toBe(true);
  });

  it("allows NUEVO → CANCELADO", () => {
    expect(canTransition("NUEVO", "CANCELADO")).toBe(true);
  });

  it("rejects NUEVO → EN_PREPARACION", () => {
    expect(canTransition("NUEVO", "EN_PREPARACION")).toBe(false);
  });

  it("rejects NUEVO → ENTREGADO", () => {
    expect(canTransition("NUEVO", "ENTREGADO")).toBe(false);
  });

  it("rejects transitions from terminal states", () => {
    expect(canTransition("ENTREGADO", "NUEVO")).toBe(false);
    expect(canTransition("CANCELADO", "CONFIRMADO")).toBe(false);
  });

  it("allows full happy path", () => {
    expect(canTransition("NUEVO", "CONFIRMADO")).toBe(true);
    expect(canTransition("CONFIRMADO", "EN_PREPARACION")).toBe(true);
    expect(canTransition("EN_PREPARACION", "LISTO")).toBe(true);
    expect(canTransition("LISTO", "EN_CAMINO")).toBe(true);
    expect(canTransition("EN_CAMINO", "ENTREGADO")).toBe(true);
  });
});
