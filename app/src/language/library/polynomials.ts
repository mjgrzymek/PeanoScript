// Define a type for a monomial term with bigint coefficients and exponents
export type PolynomialTerm = {
  coefficient: bigint;
  variables: Record<string, bigint>; // e.g., { x: 2n, y: 1n } represents x^2 * y
};

// A polynomial is an array of terms
export type Polynomial = PolynomialTerm[];

// Function to add two polynomials
export function addPolynomials(a: Polynomial, b: Polynomial): Polynomial {
  return simplifyPolynomial([...a, ...b]);
}

// Function to subtract polynomial b from polynomial a
export function subtractPolynomials(a: Polynomial, b: Polynomial): Polynomial {
  const negatedB = b.map((term) => ({
    coefficient: -term.coefficient,
    variables: { ...term.variables },
  }));
  return simplifyPolynomial([...a, ...negatedB]);
}

// Function to multiply two polynomials
export function multiplyPolynomials(a: Polynomial, b: Polynomial): Polynomial {
  const result: Polynomial = [];
  for (const termA of a) {
    for (const termB of b) {
      result.push(multiplyTerms(termA, termB));
    }
  }
  return simplifyPolynomial(result);
}

// Function to check if two polynomials are equal
export function polynomialsAreEqual(a: Polynomial, b: Polynomial): boolean {
  const simplifiedA = simplifyPolynomial(a);
  const simplifiedB = simplifyPolynomial(b);

  if (simplifiedA.length !== simplifiedB.length) {
    return false;
  }

  for (const termA of simplifiedA) {
    const matchingTerm = simplifiedB.find((termB) =>
      termsAreEquivalent(termA, termB)
    );
    if (!matchingTerm) {
      return false;
    }
  }

  return true;
}

// Helper function to multiply two terms
export function multiplyTerms(
  a: PolynomialTerm,
  b: PolynomialTerm
): PolynomialTerm {
  const coefficient = a.coefficient * b.coefficient;
  const variables: Record<string, bigint> = { ...a.variables };

  for (const [variable, exponent] of Object.entries(b.variables)) {
    variables[variable] = (variables[variable] || 0n) + exponent;
  }

  return { coefficient, variables };
}

// Helper function to simplify a polynomial (combine like terms)
export function simplifyPolynomial(polynomial: Polynomial): Polynomial {
  const termMap: Map<string, PolynomialTerm> = new Map();

  for (const term of polynomial) {
    const key = termKey(term.variables);

    if (termMap.has(key)) {
      // Combine coefficients of like terms
      const existingTerm = termMap.get(key)!;
      existingTerm.coefficient += term.coefficient;
    } else {
      termMap.set(key, {
        coefficient: term.coefficient,
        variables: { ...term.variables },
      });
    }
  }

  // Filter out terms with zero coefficient
  return Array.from(termMap.values()).filter((term) => term.coefficient !== 0n);
}

// Helper function to check if two terms are equivalent (same variables and exponents)
export function termsAreEquivalent(
  a: PolynomialTerm,
  b: PolynomialTerm
): boolean {
  if (a.coefficient !== b.coefficient) {
    return false;
  }

  const varsA = a.variables;
  const varsB = b.variables;

  if (Object.keys(varsA).length !== Object.keys(varsB).length) {
    return false;
  }

  for (const variable of Object.keys(varsA)) {
    if (varsA[variable] !== varsB[variable]) {
      return false;
    }
  }

  return true;
}

// Helper function to generate a unique key for a term's variables
function termKey(variables: Record<string, bigint>): string {
  return Object.entries(variables)
    .sort()
    .map(([variable, exponent]) => `${variable}^${exponent.toString()}`)
    .join("*");
}
