import { describe, it, expect } from 'vitest';
import { detectLang } from '../../src/js/core/detectLang.js';

describe('detectLang', () => {
  it('returns null for empty/blank input', () => {
    expect(detectLang('')).toBeNull();
    expect(detectLang('   ')).toBeNull();
    expect(detectLang(null)).toBeNull();
  });

  it('detects JavaScript', () => {
    expect(detectLang('const x = 1;\nconsole.log(x);')).toBe('javascript');
    expect(detectLang("import React from 'react';\nconst App = () => <div/>;")).toBe('javascript');
    expect(detectLang('const fn = async () => { return await fetch(url); };')).toBe('javascript');
  });

  it('detects TypeScript (before JavaScript)', () => {
    expect(detectLang('interface User { name: string; age: number; }')).toBe('typescript');
    expect(detectLang('type Result<T> = { data: T; error: string | null };')).toBe('typescript');
    expect(detectLang('const greet = (name: string): void => { console.log(name); };')).toBe('typescript');
  });

  it('detects Python', () => {
    expect(detectLang('def hello(name):\n    print(f"Hello {name}")')).toBe('python');
    expect(detectLang('import os\nfrom pathlib import Path')).toBe('python');
    expect(detectLang("if __name__ == '__main__':\n    main()")).toBe('python');
  });

  it('detects HTML', () => {
    expect(detectLang('<!DOCTYPE html>\n<html><body><p>Hello</p></body></html>')).toBe('html');
    expect(detectLang('<div class="container"><button type="submit">OK</button></div>')).toBe('html');
  });

  it('detects CSS', () => {
    expect(detectLang('body { margin: 0; padding: 0; }\nh1 { color: red; font-size: 24px; }')).toBe('css');
    expect(detectLang('.container { display: flex; gap: 8px; }')).toBe('css');
  });

  it('detects SCSS (// comments + & nesting)', () => {
    const scss = `.an-icon-cell {
  color: #a6adc8;        // label text màu nhạt hơn
  i { color: #cdd6f4; } // FA icon override sang màu sáng
  &:hover { background: #2a2a3e; border-color: #45475a; }
  &.active {
    background: rgba(#818cf8, 0.15);
    border-color: #818cf8;
    color: #818cf8;
    i { color: #818cf8; }
  }
}`;
    expect(detectLang(scss)).toBe('scss');
  });

  it('detects SCSS ($variables and @mixin)', () => {
    expect(detectLang('$primary: #3b82f6;\n.btn { color: $primary; background: darken($primary, 10%); }')).toBe('scss');
    expect(detectLang('@mixin flex-center {\n  display: flex;\n  align-items: center;\n}\n.box { @include flex-center; }')).toBe('scss');
  });

  it('detects JSON', () => {
    expect(detectLang('{\n  "name": "autumn-note",\n  "version": "1.0"\n}')).toBe('json');
    expect(detectLang('[\n  { "id": 1, "title": "Post" }\n]')).toBe('json');
  });

  it('detects SQL', () => {
    expect(detectLang('SELECT id, name FROM users WHERE active = 1 ORDER BY name;')).toBe('sql');
    expect(detectLang('INSERT INTO orders (product_id, qty) VALUES (42, 3);')).toBe('sql');
    expect(detectLang('CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(255));')).toBe('sql');
  });

  it('detects Bash/Shell', () => {
    expect(detectLang('#!/bin/bash\necho "Hello World"')).toBe('bash');
    expect(detectLang('npm install express\nnpm run build')).toBe('bash');
    expect(detectLang('docker run -d -p 80:80 nginx\ndocker compose up')).toBe('bash');
  });

  it('detects Java', () => {
    expect(detectLang('public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}')).toBe('java');
    expect(detectLang('@Override\npublic void run() { System.out.println("running"); }')).toBe('java');
  });

  it('detects C#', () => {
    expect(detectLang('using System;\nnamespace MyApp;\nConsole.WriteLine("Hello");')).toBe('csharp');
    expect(detectLang('public async Task<string> GetDataAsync() { return await client.GetStringAsync(url); }')).toBe('csharp');
  });

  it('detects PHP', () => {
    expect(detectLang('<?php\n$name = "World";\necho "Hello " . $name;')).toBe('php');
    expect(detectLang('$users = User::where("active", 1)->get();')).toBe('php');
  });

  it('detects Ruby', () => {
    expect(detectLang("def greet(name)\n  puts \"Hello #{name}\"\nend")).toBe('ruby');
    expect(detectLang("[1, 2, 3].each do |n|\n  puts n\nend")).toBe('ruby');
  });

  it('detects Go', () => {
    expect(detectLang('package main\nimport "fmt"\nfunc main() { fmt.Println("Hello") }')).toBe('go');
    expect(detectLang('x := 42\nfmt.Sprintf("value: %d", x)')).toBe('go');
  });

  it('detects Rust', () => {
    expect(detectLang('fn main() {\n  let mut x = 5;\n  println!("{}", x);\n}')).toBe('rust');
    expect(detectLang('use std::collections::HashMap;\nimpl MyStruct { pub fn new() -> Self { Self {} } }')).toBe('rust');
  });

  it('detects C++ (before C)', () => {
    expect(detectLang('#include <iostream>\nusing namespace std;\ncout << "Hello" << endl;')).toBe('cpp');
    expect(detectLang('template<typename T>\nvoid swap(T& a, T& b) { std::swap(a, b); }')).toBe('cpp');
  });

  it('detects C', () => {
    expect(detectLang('#include <stdio.h>\nint main() { printf("Hello"); return 0; }')).toBe('c');
    expect(detectLang('#include <stdlib.h>\nvoid* p = malloc(sizeof(int) * 10);')).toBe('c');
  });

  it('detects Kotlin', () => {
    expect(detectLang('fun main() {\n  val name = "World"\n  println("Hello $name")\n}')).toBe('kotlin');
    expect(detectLang('data class User(val id: Int, val name: String)\ncompanion object { }')).toBe('kotlin');
  });

  it('detects Swift', () => {
    expect(detectLang('func greet(name: String) -> String {\n  return "Hello, \\(name)!"\n}')).toBe('swift');
    expect(detectLang('var x: Int = 5\nlet y: String = "hello"\nprint(x)')).toBe('swift');
  });

  it('detects XML', () => {
    expect(detectLang('<?xml version="1.0" encoding="UTF-8"?>\n<root><item>value</item></root>')).toBe('xml');
    expect(detectLang('<config xmlns:app="http://example.com">\n  <app:setting>true</app:setting>\n</config>')).toBe('xml');
  });

  it('returns null for plain prose text', () => {
    expect(detectLang('This is just a regular sentence.')).toBeNull();
    expect(detectLang('Hello world, how are you today?')).toBeNull();
    expect(detectLang('1 + 2 = 3')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Scoring behaviour — constructs the ordered if-chain used to miss or misfile
// ---------------------------------------------------------------------------

describe('detectLang — previously misdetected snippets', () => {
  it.each([
    ['a JS module default export', 'export default {\n  data() { return { a: 1 }; }\n}', 'javascript'],
    ['a one-line DOM call chain', "document.querySelector('.x').addEventListener('click', h)", 'javascript'],
    ['a CommonJS export', 'module.exports = { a: 1 };', 'javascript'],
    ['a generic TS function', 'function f<T>(a: T): T { return a; }', 'typescript'],
    ['a Python with-block', "with open('f.txt') as f:\n    data = f.read()", 'python'],
    ['a Python comprehension', 'x = [i**2 for i in range(5)]', 'python'],
    ['a Java field declaration', 'private final List<String> items = new ArrayList<>();', 'java'],
    ['a Go struct type', 'type Server struct {\n  Addr string\n}', 'go'],
    ['a Go method receiver', 'func (s *Server) Start() error {\n  return nil\n}', 'go'],
    ['a Rust pub struct', 'pub struct Config { pub name: String }', 'rust'],
    ['a single-line CSS rule', '#main > .item:hover { background: #fff; }', 'css'],
    ['a shell command chain', 'cd /var/www && ls -la', 'bash'],
    ['a shell for-loop', 'for f in *.txt; do\n  mv "$f" "$f.bak"\ndone', 'bash'],
    ['a shell export', 'export PATH=$PATH:/usr/local/bin', 'bash'],
    ['a PHP method', "public function index() {\n  return view('home');\n}", 'php'],
    ['a C# expression-bodied member', 'public async Task<int> GetAsync() => await _repo.CountAsync();', 'csharp'],
    ['a Swift guard with assignment', 'guard let x = y else { return }', 'swift'],
  ])('detects %s', (_label, code, want) => expect(detectLang(code)).toBe(want));
});

describe('detectLang — YAML and Markdown', () => {
  it.each([
    ['a GitHub Actions workflow', 'name: CI\non:\n  push:\n    branches: [main]'],
    ['a compose file', "version: '3'\nservices:\n  web:\n    image: nginx"],
    ['a sequence of mappings', '- name: step one\n  run: echo hi'],
  ])('detects %s as YAML', (_label, code) => expect(detectLang(code)).toBe('yaml'));

  it.each([
    ['a heading with emphasis and a list', '# Title\n\nSome **bold** text.\n\n- a\n- b'],
    ['a heading with a link', '## Heading\n\nSee [docs](http://e.com) for more.'],
    ['a GFM table', '| a | b |\n| --- | --- |\n| 1 | 2 |'],
  ])('detects %s as Markdown', (_label, code) => expect(detectLang(code)).toBe('markdown'));
});

describe('detectLang — declines to guess', () => {
  it.each([
    ['ordinary prose', 'Hello world, this is just a sentence.'],
    ['a bare word', 'foo'],
    ['digits', '12345'],
  ])('returns null for %s', (_label, text) => expect(detectLang(text)).toBeNull());

  it('returns null rather than picking a side when two languages tie', () => {
    // A single shared signal is not evidence. The scorer needs both a minimum
    // total and a margin over the runner-up before it commits to an answer.
    expect(detectLang('x = 1')).toBeNull();
  });
});

describe('detectLang — superset languages keep their base language evidence', () => {
  it('reads SCSS markers over the surrounding plain CSS', () => {
    // Every line here is also valid CSS; the $variable and & are what decide it.
    expect(detectLang('$c: red;\n.a {\n  color: $c;\n  &:hover { color: blue; }\n}')).toBe('scss');
  });

  it('reads TypeScript annotations over the surrounding plain JavaScript', () => {
    expect(detectLang("const n: number = 1;\nconsole.log(n);")).toBe('typescript');
  });

  it('still reports plain CSS and plain JavaScript as themselves', () => {
    expect(detectLang('.a { color: red; padding: 4px; }')).toBe('css');
    expect(detectLang('const n = 1;\nconsole.log(n);')).toBe('javascript');
  });
});

describe('SUPPORTED_LANGS', () => {
  it('lists exactly the languages the detector can return', async () => {
    const { SUPPORTED_LANGS } = await import('../../src/js/core/detectLang.js');
    expect(new Set(SUPPORTED_LANGS).size).toBe(SUPPORTED_LANGS.length);
    expect(SUPPORTED_LANGS).toContain('yaml');
    expect(SUPPORTED_LANGS).toContain('markdown');
  });
});
