// polynomials.test.ts

import {
  Polynomial,
  addPolynomials,
  subtractPolynomials,
  multiplyPolynomials,
  polynomialsAreEqual,
  simplifyPolynomial,
} from "./polynomials";
import { expect, test, describe } from "vitest";

describe("Polynomial Operations", () => {
  test("addPolynomials correctly adds two polynomials", () => {
    const poly1: Polynomial = [
      { coefficient: 2n, variables: { x: 2n, y: 1n } }, // 2x^2y
      { coefficient: 3n, variables: { x: 1n, y: 2n } }, // 3xy^2
    ];

    const poly2: Polynomial = [
      { coefficient: -1n, variables: { x: 2n, y: 1n } }, // -x^2y
      { coefficient: 4n, variables: { y: 2n } }, // 4y^2
    ];

    const expectedSum: Polynomial = [
      { coefficient: 1n, variables: { x: 2n, y: 1n } }, // (2 - 1)x^2y
      { coefficient: 3n, variables: { x: 1n, y: 2n } }, // 3xy^2
      { coefficient: 4n, variables: { y: 2n } }, // 4y^2
    ];

    const sum = addPolynomials(poly1, poly2);
    expect(polynomialsAreEqual(sum, expectedSum)).toBe(true);
  });

  test("subtractPolynomials correctly subtracts two polynomials", () => {
    const poly1: Polynomial = [
      { coefficient: 5n, variables: { x: 1n } }, // 5x
      { coefficient: 2n, variables: { x: 2n } }, // 2x^2
    ];

    const poly2: Polynomial = [
      { coefficient: 3n, variables: { x: 1n } }, // 3x
      { coefficient: 1n, variables: {} }, // 1
    ];

    const expectedDifference: Polynomial = [
      { coefficient: 2n, variables: { x: 1n } }, // (5 - 3)x
      { coefficient: 2n, variables: { x: 2n } }, // 2x^2
      { coefficient: -1n, variables: {} }, // -1
    ];

    const difference = subtractPolynomials(poly1, poly2);
    expect(polynomialsAreEqual(difference, expectedDifference)).toBe(true);
  });

  test("multiplyPolynomials correctly multiplies two polynomials", () => {
    const poly1: Polynomial = [
      { coefficient: 2n, variables: { x: 1n } }, // 2x
      { coefficient: 3n, variables: {} }, // 3
    ];

    const poly2: Polynomial = [
      { coefficient: 4n, variables: { x: 1n } }, // 4x
      { coefficient: -1n, variables: {} }, // -1
    ];

    const expectedProduct: Polynomial = [
      { coefficient: 8n, variables: { x: 2n } }, // 2x * 4x = 8x^2
      { coefficient: -2n, variables: { x: 1n } }, // 2x * -1 = -2x
      { coefficient: 12n, variables: { x: 1n } }, // 3 * 4x = 12x
      { coefficient: -3n, variables: {} }, // 3 * -1 = -3
    ];

    const product = multiplyPolynomials(poly1, poly2);
    expect(polynomialsAreEqual(product, expectedProduct)).toBe(true);
  });

  test("polynomialsAreEqual correctly checks polynomial equality", () => {
    const poly1: Polynomial = [
      { coefficient: 3n, variables: { x: 1n, y: 1n } }, // 3xy
      { coefficient: -2n, variables: { x: 2n } }, // -2x^2
    ];

    const poly2: Polynomial = [
      { coefficient: -2n, variables: { x: 2n } }, // -2x^2
      { coefficient: 3n, variables: { y: 1n, x: 1n } }, // 3xy (order of variables doesn't matter)
    ];

    expect(polynomialsAreEqual(poly1, poly2)).toBe(true);
  });

  test("simplifyPolynomial combines like terms", () => {
    const poly: Polynomial = [
      { coefficient: 2n, variables: { x: 1n } }, // 2x
      { coefficient: 3n, variables: { x: 1n } }, // 3x
      { coefficient: -5n, variables: { x: 1n } }, // -5x
    ];

    const expectedSimplified: Polynomial = []; // Coefficient sums to zero, so term is removed

    const simplified = simplifyPolynomial(poly);
    expect(simplified).toEqual(expectedSimplified);
  });

  test("multiplyPolynomials handles exponents correctly", () => {
    const poly1: Polynomial = [
      { coefficient: 1n, variables: { x: 1n } }, // x
    ];

    const poly2: Polynomial = [
      { coefficient: 1n, variables: { x: 1n } }, // x
    ];

    const expectedProduct: Polynomial = [
      { coefficient: 1n, variables: { x: 2n } }, // x^2
    ];

    const product = multiplyPolynomials(poly1, poly2);
    expect(polynomialsAreEqual(product, expectedProduct)).toBe(true);
  });

  test("Operations with zero coefficients", () => {
    const poly1: Polynomial = [
      { coefficient: 0n, variables: { x: 1n } }, // 0x
      { coefficient: 3n, variables: { x: 1n } }, // 3x
    ];

    const poly2: Polynomial = [
      { coefficient: -3n, variables: { x: 1n } }, // -3x
    ];

    const sum = addPolynomials(poly1, poly2);
    const expectedSum: Polynomial = []; // 0x

    expect(polynomialsAreEqual(sum, expectedSum)).toBe(true);
  });
});
