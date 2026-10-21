/*
  semgrep-typescript

  Extends the standard typescript grammar with semgrep pattern constructs.
*/

const typescript_grammar =
      require('tree-sitter-typescript/typescript/grammar');

const semgrepExt = require('../common/semgrep-ext');

module.exports = grammar(typescript_grammar, {
  name: 'typescript',
  ...semgrepExt,
  rules: {
    ...semgrepExt.rules,

    // TypeScript 5.0 type-only star re-exports:
    //   export type * from "…";
    //   export type * as ns from "…";
    //
    // The pinned upstream grammar (tree-sitter-typescript@75b3874) only
    // accepts the named form `export type { A } from "…"`; the star forms
    // produce an ERROR node and silently truncate parsing
    // (semgrep/semgrep#11871; upstream tree-sitter/tree-sitter-typescript#348,
    // still open). Wrapping `previous` (rather than copying the upstream rule)
    // keeps the generated CST variant names for the existing alternatives
    // stable. Drop this override when the upstream grammar adds support.
    export_statement: ($, previous) => choice(
      previous,
      seq(
        'export',
        'type',
        choice(
          seq('*', $._from_clause),
          seq($.namespace_export, $._from_clause),
        ),
        $._semicolon,
      ),
    ),
  },
});
