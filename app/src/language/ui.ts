import { ExpressionAst, StatementAst, TypeAst } from "./parsing/astTypes";

export function unparseAst(
  ast: ExpressionAst | StatementAst | TypeAst
): string {
  // Handle ExpressionAst

  if (ast.type === "num") {
    return ast.value;
  }

  if (ast.type === "identifier") {
    return ast.value;
  }
  if (ast.type === "+") {
    return `(${unparseAst(ast.left)} + ${unparseAst(ast.right)})`;
  }

  if (ast.type === "*") {
    return `(${unparseAst(ast.left)} * ${unparseAst(ast.right)})`;
  }

  if (ast.type === "e=>") {
    let result = `(${ast.leftName}`;
    if (ast.left) {
      result += `: ${unparseAst(ast.left)}`;
    }
    result += ` => ${unparseAst(ast.right)}`;
    if (ast.assertion) {
      result += ` : ${unparseAst(ast.assertion)}`;
    }
    result += `)`;
    return result;
  }

  if (ast.type === "efield") {
    return `${ast.left}: ${unparseAst(ast.right)}`;
  }

  if (ast.type === "estruct") {
    const fields = ast.value
      .map((field) => `${field.left}: ${unparseAst(field.right)}`)
      .join(", ");
    return `{ ${fields} }`;
  }

  if (ast.type === "as") {
    return `${unparseAst(ast.left)} as ${unparseAst(ast.right)}`;
  }

  if (ast.type === ".") {
    return `${unparseAst(ast.left)}.${ast.right}`;
  }

  if (ast.type === "for") {
    const iterStr = unparseAst(ast.iter);
    const proofStr = unparseAst(ast.proof);
    const condStr = `${unparseAst(ast.cond.left)} < ${unparseAst(
      ast.cond.right
    )}`;
    const stepStr = `${ast.step.value}++`;
    const bodyStr = unparseAst(ast.body);
    return `for (${iterStr} ${proofStr}; ${condStr}; ${stepStr}) { ${bodyStr} }`;
  }

  // Handle TypeAst
  if (ast.type === "==") {
    return `(${unparseAst(ast.left)} == ${unparseAst(ast.right)})`;
  }

  if (ast.type === "||") {
    return `(${unparseAst(ast.left)} || ${unparseAst(ast.right)})`;
  }

  if (ast.type === "&&") {
    return `(${unparseAst(ast.left)} && ${unparseAst(ast.right)})`;
  }

  if (ast.type === "t=>") {
    let result = `(${ast.leftName}`;
    if (ast.left) {
      result += `: ${unparseAst(ast.left)}`;
    }
    result += ` => ${unparseAst(ast.right)}`;
    result += `)`;
    return result;
  }

  if (ast.type === "tstruct") {
    const fields = ast.value
      .map((field) => `${field.left}: ${unparseAst(field.right)}`)
      .join("; ");
    return `{${fields}}`;
  }

  // Handle StatementAst
  if (ast.type === "return") {
    return `return ${unparseAst(ast.value)};`;
  }

  if (ast.type === "const") {
    const assertion = ast.assertion ? `: ${unparseAst(ast.assertion)}` : "";
    return `const ${ast.left}${assertion} = ${unparseAst(ast.right)};`;
  }

  if (ast.type === "multi const") {
    return `const ${ast.left.join(", ")} = ${unparseAst(ast.right)};`;
  }

  if (ast.type === "switch") {
    let casesStr = "";
    for (const c of ast.cases) {
      const caseCondition = `case {${c.left.left}: ${c.left.right}}:`;
      let bodyStr = "";
      for (const stmt of c.right.value) {
        bodyStr += `${unparseAst(stmt)} `;
      }
      casesStr += `${caseCondition}: { ${bodyStr} }`;
    }
    return `switch (${unparseAst(ast.value)}) { ${casesStr} }`;
  }

  if (ast.type === "call") {
    return `${unparseAst(ast.left)}(${
      ast.right === "empty call" ? "" : unparseAst(ast.right)
    })`;
  }
  if (ast.type === "e&&") {
    return `${unparseAst(ast.left)} && ${unparseAst(ast.right)}`;
  }
  if (ast.type === "generic call") {
    return `${ast.left}<${unparseAst(ast.right)}>`;
  }
  if (ast.type === "statements") {
    return ast.value.map(unparseAst).join("\n");
  }

  if (ast.type === "t!") {
    return `!${unparseAst(ast.value)}`;
  }
  if (ast.type === "typedef") {
    return `type ${ast.left} = ${unparseAst(ast.right)};`;
  }
  if (ast.type === "generic typedef") {
    return `type ${ast.name}<${ast.parameters
      .map((p) => `${p.name.value} extends ${p.constraint.value}`)
      .join(", ")}> = ${unparseAst(ast.value)};`;
  }
  if (ast.type === "!=") {
    return `(${unparseAst(ast.left)} != ${unparseAst(ast.right)})`;
  }
  if (ast.type === "type generic call") {
    return `${ast.left}<${ast.right.map(unparseAst).join(", ")}>`;
  }
  if (ast.type === "empty statement") {
    return ";";
  }
  if (ast.type === "console.log") {
    return `console.log(${ast.value.map(unparseAst).join(", ")});`;
  }
  const _: never = ast.type;
  // If none of the types matched
  throw new Error(
    `unparseAst: unsupported AST node type: ${ast.type} in "${JSON.stringify(
      ast
    )}"`
  );
}

export function bigintStringify(obj: unknown) {
  return JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? `${v}` : v));
}
