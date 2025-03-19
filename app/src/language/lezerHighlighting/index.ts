import { parser } from "./lezerparser";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const EXAMPLELanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Identifier: t.variableName,
        LineComment: t.comment,
        Keyword: t.keyword,
        Number: t.integer,
        Prenumber: t.integer,
        Special: t.atom,
        SpecialFunc: t.string,
        Equals: t.strong,
        Sorry: t.className,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "//" },
  },
});
export function EXAMPLE() {
  return new LanguageSupport(EXAMPLELanguage);
}
