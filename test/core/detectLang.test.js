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
