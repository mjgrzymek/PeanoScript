// tret == as polynomial
import {
  Polynomial,
  addPolynomials,
  multiplyPolynomials,
  polynomialsAreEqual,
  simplifyPolynomial,
  subtractPolynomials,
} from "./polynomials";

import { ArithmeticTree, TypeTreeEq } from "../engineTypes";

export function ArithmeticTreeToPolynomial(ast: ArithmeticTree): Polynomial {
  if (ast.type === "zero") {
    // Return zero polynomial
    return [];
  } else if (ast.type === "succ") {
    const innerPolynomial = ArithmeticTreeToPolynomial(ast.value);
    const onePolynomial: Polynomial = [{ coefficient: 1n, variables: {} }];
    return addPolynomials(innerPolynomial, onePolynomial);
  } else if (ast.type === "var") {
    // Return polynomial with coefficient 1 and the variable
    return [{ coefficient: 1n, variables: { [ast.value]: 1n } }];
  } else if (ast.type === "+") {
    // Recursively convert left and right, then add
    return addPolynomials(
      ArithmeticTreeToPolynomial(ast.left),
      ArithmeticTreeToPolynomial(ast.right)
    );
  } else if (ast.type === "*") {
    // Recursively convert left and right, then multiply
    return multiplyPolynomials(
      ArithmeticTreeToPolynomial(ast.left),
      ArithmeticTreeToPolynomial(ast.right)
    );
  } else {
    const _: never = ast.type;
    throw new Error(
      `ArithmeticTreeToPolynomial: unsupported node type: ${ast.type}`
    );
  }
}

export function identitiesEquivalent(a: TypeTreeEq, b: TypeTreeEq): boolean {
  // Compute the difference polynomials for both identities: left - right
  const diffPolyA = simplifyPolynomial(
    subtractPolynomials(
      ArithmeticTreeToPolynomial(a.left),
      ArithmeticTreeToPolynomial(a.right)
    )
  );

  const diffPolyB = simplifyPolynomial(
    subtractPolynomials(
      ArithmeticTreeToPolynomial(b.left),
      ArithmeticTreeToPolynomial(b.right)
    )
  );

  // Check if the difference polynomials are equal
  if (polynomialsAreEqual(diffPolyA, diffPolyB)) {
    return true;
  }

  // Check if one is the negation of the other
  const negatedDiffPolyB = diffPolyB.map((term) => ({
    coefficient: -term.coefficient,
    variables: term.variables,
  }));

  if (polynomialsAreEqual(diffPolyA, negatedDiffPolyB)) {
    return true;
  }

  return false;
}
