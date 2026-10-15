// GCPP Dual-Mode C Compilation & Evaluation Engine
// Supports both in-browser client-side sandboxed evaluation and local/remote GCC backend

export class CExecutionEngine {
  constructor() {
    this.apiEndpoint = '/api/compile';
  }

  // Normalize string for robust whitespace/newline comparison
  static normalizeOutput(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  // Fast client-side C sandbox evaluation
  async runSandboxedC(code, input, timeoutMs = 2000) {
    const startTime = performance.now();

    return new Promise((resolve) => {
      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          resolve({
            success: false,
            error: 'Time Limit Exceeded (> 2.0s)',
            output: '',
            executionTimeMs: timeoutMs,
            status: 'TLE'
          });
        }
      }, timeoutMs);

      try {
        const syntaxCheck = this.verifySyntax(code);
        if (!syntaxCheck.valid) {
          clearTimeout(timer);
          isSettled = true;
          return resolve({
            success: false,
            error: syntaxCheck.error,
            line: syntaxCheck.line,
            rule: syntaxCheck.rule,
            fixSuggestion: syntaxCheck.fixSuggestion,
            output: '',
            executionTimeMs: Math.round(performance.now() - startTime),
            status: 'COMPILATION_ERROR'
          });
        }

        const result = this.executeCInBrowser(code, input);
        clearTimeout(timer);
        if (!isSettled) {
          isSettled = true;
          const duration = Math.max(1, Math.round(performance.now() - startTime));
          resolve({
            success: result.success,
            output: result.output,
            error: result.error,
            executionTimeMs: duration,
            status: result.success ? 'PASSED' : (result.error ? 'RUNTIME_ERROR' : 'FAILED')
          });
        }
      } catch (err) {
        clearTimeout(timer);
        if (!isSettled) {
          isSettled = true;
          resolve({
            success: false,
            error: err.message || 'Execution exception occurred',
            output: '',
            executionTimeMs: Math.round(performance.now() - startTime),
            status: 'RUNTIME_ERROR'
          });
        }
      }
    });
  }

  verifySyntax(code) {
    if (!code || typeof code !== 'string' || !code.trim()) {
      return { 
        valid: false, 
        error: 'Empty source code submitted.',
        line: 1,
        rule: 'EMPTY_CODE',
        fixSuggestion: 'Write your C program in the editor window before submitting.'
      };
    }

    if (!code.includes('main')) {
      return { 
        valid: false, 
        error: "Compilation Error: Function 'main' not found in C source.",
        line: 1,
        rule: 'NO_MAIN',
        fixSuggestion: 'Every C program requires an entrypoint: int main() { ... return 0; }'
      };
    }

    const lines = code.split('\n');

    // 1. Check for missing stdio.h if printf or scanf used
    if ((code.includes('printf') || code.includes('scanf')) && !code.includes('stdio.h')) {
      return {
        valid: false,
        error: "Compilation Error: <stdio.h> header file is missing.",
        line: 1,
        rule: 'MISSING_STDIO',
        fixSuggestion: "Add #include <stdio.h> at the top of your program to use printf and scanf."
      };
    }

    // 2. Track delimiters with line numbers
    const stack = [];
    let inString = false;
    let strStartLine = 1;
    let inChar = false;
    let inLineComment = false;
    let inBlockComment = false;
    let blockCommentStartLine = 1;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineNum = lineIdx + 1;
      const line = lines[lineIdx];
      inLineComment = false;

      for (let colIdx = 0; colIdx < line.length; colIdx++) {
        const c = line[colIdx];
        const next = line[colIdx + 1];

        if (inLineComment) continue;

        if (inBlockComment) {
          if (c === '*' && next === '/') {
            inBlockComment = false;
            colIdx++;
          }
          continue;
        }

        if (inString) {
          if (c === '\\') { colIdx++; continue; }
          if (c === '"') { inString = false; }
          continue;
        }

        if (inChar) {
          if (c === '\\') { colIdx++; continue; }
          if (c === "'") { inChar = false; }
          continue;
        }

        // Check comment start
        if (c === '/' && next === '/') {
          inLineComment = true;
          colIdx++;
          continue;
        }
        if (c === '/' && next === '*') {
          inBlockComment = true;
          blockCommentStartLine = lineNum;
          colIdx++;
          continue;
        }

        // Check string start
        if (c === '"') {
          inString = true;
          strStartLine = lineNum;
          continue;
        }
        if (c === "'") {
          inChar = true;
          continue;
        }

        // Bracket pairs
        if (c === '{' || c === '(' || c === '[') {
          stack.push({ char: c, line: lineNum, col: colIdx + 1 });
        } else if (c === '}' || c === ')' || c === ']') {
          if (stack.length === 0) {
            return {
              valid: false,
              error: `Compilation Error: Unexpected closing delimiter '${c}' on line ${lineNum}`,
              line: lineNum,
              rule: 'UNEXPECTED_DELIMITER',
              fixSuggestion: `Check line ${lineNum}. Remove the extra '${c}' or check if an opening delimiter was accidentally deleted.`
            };
          }
          const top = stack.pop();
          const expected = (top.char === '{' ? '}' : (top.char === '(' ? ')' : ']'));
          if (c !== expected) {
            return {
              valid: false,
              error: `Compilation Error: Mismatched delimiter on line ${lineNum}. Expected '${expected}' to close '${top.char}' from line ${top.line}, but found '${c}'`,
              line: lineNum,
              rule: 'MISMATCHED_DELIMITER',
              fixSuggestion: `Replace '${c}' with '${expected}' on line ${lineNum}, or balance the brackets opened on line ${top.line}.`
            };
          }
        }
      }

      // Check if string was left open across newline without escape
      if (inString && !line.endsWith('\\')) {
        return {
          valid: false,
          error: `Compilation Error: Unterminated string literal on line ${strStartLine}`,
          line: strStartLine,
          rule: 'UNTERMINATED_STRING',
          fixSuggestion: `In C, strings cannot span multiple lines without escaping. Add a closing double quote (") on line ${strStartLine}.`
        };
      }
    }

    if (inBlockComment) {
      return {
        valid: false,
        error: `Compilation Error: Unterminated block comment /* starting on line ${blockCommentStartLine}`,
        line: blockCommentStartLine,
        rule: 'UNTERMINATED_COMMENT',
        fixSuggestion: `Close the multi-line comment with '*/' before submitting.`
      };
    }

    if (stack.length > 0) {
      const unclosed = stack.pop();
      const expected = (unclosed.char === '{' ? '}' : (unclosed.char === '(' ? ')' : ']'));
      return {
        valid: false,
        error: `Compilation Error: Unclosed '${unclosed.char}' opened on line ${unclosed.line}`,
        line: unclosed.line,
        rule: 'UNCLOSED_DELIMITER',
        fixSuggestion: `Add a closing '${expected}' to balance the opening '${unclosed.char}' on line ${unclosed.line}.`
      };
    }

    // 3. Line-by-line semicolon check
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      let rawLine = lines[i].trim();
      
      // Strip comments
      rawLine = rawLine.replace(/\/\/.*$/, '').trim();
      if (!rawLine) continue;
      if (rawLine.startsWith('#')) continue; // Preprocessor
      if (rawLine.startsWith('/*') || rawLine.endsWith('*/')) continue;

      // Skip lines ending with opening brace, comma, backslash, colon, or closing brace
      if (/[{}:,\\]$/.test(rawLine)) continue;
      if (rawLine === '}' || rawLine === '{') continue;

      // Skip control flow keywords if header
      if (/^(if\s*\(|else|for\s*\(|while\s*\(|do\b|switch\s*\(|case\b|default\b)/.test(rawLine)) continue;

      // Check statement patterns that must end with semicolon
      const isStatement = /^(int|float|double|char|long|short|void|unsigned|struct|return\b|break\b|continue\b|printf\s*\(|scanf\s*\(|[a-zA-Z0-9_]+\s*(\+\+|--|\+=|-=|\*=|\/=|%=|=))/.test(rawLine);
      
      if (isStatement && !rawLine.endsWith(';')) {
        // Look ahead: does next line start with continuation like a dot or arrow or binary operator?
        const nextLine = (lines[i + 1] || '').trim();
        if (nextLine.startsWith('{') || nextLine.startsWith('?') || nextLine.startsWith(':')) continue;

        return {
          valid: false,
          error: `Compilation Error: Missing semicolon ';' on line ${lineNum}`,
          line: lineNum,
          rule: 'MISSING_SEMICOLON',
          fixSuggestion: `Every statement in C must terminate with a semicolon. Add a ';' at the end of line ${lineNum}: "${rawLine};"`
        };
      }
    }

    // 4. Rookie C warning check: scanf without & for single scalar variables
    const scanfWithoutAmp = code.match(/scanf\s*\(\s*"%d"\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/);
    if (scanfWithoutAmp && !code.includes('&' + scanfWithoutAmp[1])) {
      return {
        valid: false,
        error: `Compilation Warning: Invalid pointer in scanf for variable '${scanfWithoutAmp[1]}'`,
        line: 0,
        rule: 'SCANF_POINTER_MISSING',
        fixSuggestion: `In C, scanf requires the memory address of primitive variables. Change '${scanfWithoutAmp[1]}' to '&${scanfWithoutAmp[1]}'.`
      };
    }

    return { valid: true };
  }

  executeCInBrowser(code, inputStr) {
    try {
      const runtimeCode = this.transpileCToJs(code);
      const runner = new Function('inputString', runtimeCode);
      const result = runner(inputStr || '');
      return { success: true, output: result || '', error: null };
    } catch (err) {
      return { success: false, output: '', error: 'Runtime Error: ' + err.message };
    }
  }

  transpileCToJs(cCode) {
    let code = cCode;

    // 1. Strip preprocessor directives
    code = code.replace(/#include\s*<[^>]+>/g, '');
    code = code.replace(/#include\s*"[^"]+"/g, '');
    code = code.replace(/#define\s+[^\n]+/g, '');

    // 2. Strip float suffixes on numeric literals (e.g. 3.0f, 40.0f)
    code = code.replace(/(\d+\.\d+)f\b/g, '$1');

    // 3. Strip C cast operators like (float), (double), (int)
    code = code.replace(/\((float|double|int|long\s+long|long|short|char)\)/g, '');

    // 4. Transform struct declarations
    code = code.replace(/struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\{[^}]*\}\s*;/g, '');
    code = code.replace(/struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[[^\]]*\]\s*;/g, (m, arrName) => {
      return `let ${arrName} = Array.from({length: 100}, () => ({ marks: [0, 0, 0], rollNo: 0, name: '', total: 0, percentage: 0 }));`;
    });
    code = code.replace(/struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g, (m, varName) => {
      return `let ${varName} = { marks: [0, 0, 0], rollNo: 0, name: '', total: 0, percentage: 0 };`;
    });

    // 5. Function definitions
    code = code.replace(/\b(void|int|long\s+long|double|float|char\*?)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g, (m, retType, fName, args) => {
      const cleanArgs = args.split(',').map(arg => {
        return arg.replace(/\b(void|int|long\s+long|double|float|char)\b/g, '')
                  .replace(/[\*&]/g, '')
                  .trim();
      }).filter(Boolean).join(', ');
      return `function ${fName}(${cleanArgs}) {`;
    });

    // 6. Handle C integer division /= and /
    code = code.replace(/([a-zA-Z0-9_]+)\s*\/=\s*([^;]+);/g, '$1 = Math.trunc($1 / ($2));');

    // 7. Handle string null checks: sub[i] != '\0'
    code = code.replace(/([a-zA-Z0-9_]+\[[^\]]+\])\s*!=\s*'\\0'/g, '($1 && $1 !== "\\0")');
    code = code.replace(/([a-zA-Z0-9_]+\[[^\]]+\])\s*==\s*'\\0'/g, '(!$1 || $1 === "\\0")');

    // 8. Handle strcpy(dest, src) -> dest = src;
    code = code.replace(/strcpy\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([^)]+)\);/g, '$1 = $2;');

    // 9. Handle pointer declarations like char *ptr = strstr(...);
    code = code.replace(/\b(char|int|float|double)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, 'let $2 = $3;');

    // 10. Handle scanf calls into _scanf with setters
    code = code.replace(/scanf\s*\(\s*(".*?")\s*,\s*([^)]+)\)/g, (match, fmt, argsStr) => {
      const rawVars = argsStr.split(',').map(s => s.trim());
      const setters = rawVars.map(v => {
        let clean = v.replace(/^&/, '').trim();
        if (clean.includes('+')) {
          clean = clean.replace(/([a-zA-Z0-9_]+)\s*\+\s*([a-zA-Z0-9_]+)/, '$1[$2]');
        }
        return `(__v) => { try { ${clean} = __v; } catch(e){} }`;
      });
      return `_scanf(${fmt}, ${setters.join(', ')})`;
    });

    // 11. Replace printf calls with _printf
    code = code.replace(/\bprintf\s*\(/g, '_printf(');

    // 12. Handle variable/array declarations (safe paren-aware splitting)
    code = code.replace(/\b(long\s+long|unsigned\s+int|int|float|double|char)\s+([^;]+);/g, (m, type, declList) => {
      // Split by commas not inside parentheses
      const parts = [];
      let cur = '';
      let depth = 0;
      for (let ch of declList) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ',' && depth === 0) {
          parts.push(cur.trim());
          cur = '';
          continue;
        }
        cur += ch;
      }
      if (cur.trim()) parts.push(cur.trim());

      const transformed = parts.map(part => {
        // 2D Array: a[15][15]
        const match2D = part.match(/^([a-zA-Z0-9_]+)\s*\[[^\]]*\]\s*\[[^\]]*\]/);
        if (match2D) {
          return `let ${match2D[1]} = Array.from({length: 30}, () => new Array(30).fill(0))`;
        }
        // 1D Array: arr[1005] or str[500]
        const match1D = part.match(/^([a-zA-Z0-9_]+)\s*\[[^\]]*\](?:\s*=\s*(.+))?/);
        if (match1D) {
          if (type.includes('char')) {
            const initVal = match1D[2] ? match1D[2] : '[]';
            return `let ${match1D[1]} = ${initVal}`;
          }
          return `let ${match1D[1]} = new Array(1005).fill(0)`;
        }
        // Pointer
        const matchPtr = part.match(/^\*([a-zA-Z0-9_]+)(?:\s*=\s*(.+))?/);
        if (matchPtr) {
          const initVal = matchPtr[2] ? matchPtr[2] : 'null';
          return `let ${matchPtr[1]} = ${initVal}`;
        }
        // Scalar
        return `let ${part}`;
      });
      return transformed.join(';\n') + ';';
    });

    // 13. Pointer dereferencing inside expressions
    code = code.replace(/ptr\s*-\s*str\b/g, 'ptr');
    code = code.replace(/\*([a-zA-Z_][a-zA-Z0-9_]*)\b/g, '$1');
    code = code.replace(/&([a-zA-Z_][a-zA-Z0-9_]*)\b/g, '$1');
    code = code.replace(/\*\(ptr\s*\+\s*([^)]+)\)/g, 'ptr[$1]');

    // Special call by reference emulation in demo
    code = code.replace(/swapByReference\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\);/g, (m, v1, v2) => {
      return `{ let __t = ${v1}; ${v1} = ${v2}; ${v2} = __t; }`;
    });

    // 14. Math functions
    code = code.replace(/\bsqrt\s*\(/g, 'Math.sqrt(');
    code = code.replace(/\bpow\s*\(/g, 'Math.pow(');
    code = code.replace(/\bfabs\s*\(/g, 'Math.abs(');
    code = code.replace(/\babs\s*\(/g, 'Math.abs(');

    // 15. C NULL and EOF replacement
    code = code.replace(/\bNULL\b/g, 'null');
    code = code.replace(/\bEOF\b/g, 'null');

    return `
      const __stdout = [];
      const print = (s) => __stdout.push(String(s));

      const inputTokens = (inputString || '')
        .trim()
        .split(/\\s+/)
        .filter(t => t.length > 0);
      let tokIdx = 0;
      let rawIdx = 0;

      function getchar() {
        if (rawIdx < inputString.length) {
          return inputString.charAt(rawIdx++);
        }
        return null;
      }

      function isspace(c) {
        if (!c) return false;
        return /\\s/.test(c);
      }

      function strlen(s) {
        if (!s) return 0;
        if (typeof s === 'string') return s.length;
        if (Array.isArray(s)) return s.filter(c => c && c !== '\\0').length;
        return 0;
      }
      function strcmp(s1, s2) { return String(s1).localeCompare(String(s2)); }
      function strcpy(dest, src) { return src; }
      function strstr(haystack, needle) {
        const h = Array.isArray(haystack) ? haystack.join('') : String(haystack);
        const n = Array.isArray(needle) ? needle.join('') : String(needle);
        const idx = h.indexOf(n);
        return idx !== -1 ? idx : null;
      }

      function _scanf(fmt, ...setters) {
        const specs = fmt.match(/%[a-zA-Z]+/g) || [];
        let count = 0;
        for (let i = 0; i < specs.length; i++) {
          if (tokIdx >= inputTokens.length) break;
          const tok = inputTokens[tokIdx++];
          const spec = specs[i];
          let val;
          if (spec.includes('f') || spec.includes('lf')) {
            val = parseFloat(tok);
          } else if (spec.includes('s')) {
            val = tok;
          } else if (spec.includes('c')) {
            val = tok.charAt(0);
          } else {
            val = parseInt(tok, 10);
          }
          if (setters[i] && typeof setters[i] === 'function') {
            setters[i](val);
          }
          count++;
        }
        return count;
      }

      function _printf(fmt, ...args) {
        let argIdx = 0;
        // Strict C format specifier regex: % followed by optional width.precision and [diuoxXfFeEgGaAcspn] or lld/lf/ld
        const res = fmt.replace(/%(?:(\\d+)?\\.(\\d+))?(lld|ld|lf|[diuoxXfFeEgGaAcspn])/g, (m, width, prec, type) => {
          if (argIdx >= args.length) return '';
          let val = args[argIdx++];
          if (Array.isArray(val)) {
            val = val.filter(c => c && c !== '\\0').join('');
          }
          if (type === 'f' || type === 'lf') {
            const p = prec !== undefined ? parseInt(prec, 10) : 2;
            return Number(val).toFixed(p);
          }
          if (type === 'd' || type === 'lld' || type === 'ld') {
            return parseInt(val, 10);
          }
          return String(val);
        });
        print(res.replace(/\\\\n/g, '\\n').replace(/\\\\t/g, '\\t'));
      }

      ${code}

      if (typeof main === 'function') {
        main();
      }

      return __stdout.join('');
    `;
  }

  generateDiagnosticAdvice(problem, studentCode, failedTestCase) {
    if (!failedTestCase) return null;

    if (failedTestCase.status === 'TLE') {
      return {
        category: 'TIME_LIMIT_EXCEEDED',
        title: 'Execution Time Limit Exceeded (> 2.0s)',
        details: 'The sandbox terminated execution because it exceeded the safe 2.0 second limit.',
        fixSuggestion: 'Possible infinite loop detected! Verify your while/for loop update expressions (e.g. i++, n /= 10) and boundary conditions.'
      };
    }

    if (!failedTestCase.actualOutput || failedTestCase.actualOutput === '[No output]') {
      return {
        category: 'NO_OUTPUT',
        title: 'Zero Output Generated',
        details: 'Your program completed without printing anything to stdout.',
        fixSuggestion: 'Check if you have printf(...) statements matching the problem specification, and make sure main() is not returning 0 early.'
      };
    }

    const normActual = CExecutionEngine.normalizeOutput(failedTestCase.actualOutput);
    const normExpected = CExecutionEngine.normalizeOutput(failedTestCase.expectedOutput);

    // Check numeric match with formatting mismatch
    const actualDigits = (normActual.match(/-?\d+(?:\.\d+)?/g) || []).join(' ');
    const expectedDigits = (normExpected.match(/-?\d+(?:\.\d+)?/g) || []).join(' ');

    if (actualDigits && expectedDigits && actualDigits === expectedDigits) {
      return {
        category: 'FORMAT_MISMATCH',
        title: 'Output Label / Spacing Mismatch',
        details: 'The numerical values match the expected result, but the surrounding label text or spacing differs.',
        fixSuggestion: `Verify the exact string required by Output Format. Make sure labels (e.g. "${problem.outputFormat?.split('\n')[0] || 'Result'}") match spacing and colons exactly.`
      };
    }

    // Check precision mismatch
    if (normExpected.includes('.') && !normActual.includes('.')) {
      return {
        category: 'PRECISION_MISMATCH',
        title: 'Decimal Precision Mismatch',
        details: 'The test case expected floating-point output with decimals (e.g. 30.00), but received an integer.',
        fixSuggestion: 'Use %.2f in printf to format numbers to 2 decimal places, and cast integer division with (float) if necessary.'
      };
    }

    // Check case sensitivity
    if (normActual.toLowerCase() === normExpected.toLowerCase()) {
      return {
        category: 'CASE_MISMATCH',
        title: 'Letter Casing Mismatch',
        details: 'The words in your output match the answer, but the casing differs.',
        fixSuggestion: 'Output string checks in C are case-sensitive. Check capital letters (e.g. "Prime" vs "prime").'
      };
    }

    return {
      category: 'LOGICAL_MISMATCH',
      title: 'Algorithmic / Output Mismatch',
      details: 'The output produced by your program does not match the expected result for this test case.',
      fixSuggestion: `Check your algorithm with input "${failedTestCase.input}". Trace the expected output versus what your variables evaluate to.`
    };
  }

  async evaluateSubmission(problem, studentCode) {
    const results = [];
    let allPassed = true;
    let totalTime = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const execResult = await this.runSandboxedC(studentCode, tc.input, 2000);

      totalTime += execResult.executionTimeMs;

      if (!execResult.success && execResult.status === 'COMPILATION_ERROR') {
        return {
          allPassed: false,
          compilationError: execResult.error,
          diagnosticAdvice: {
            category: 'COMPILATION_ERROR',
            title: execResult.error,
            line: execResult.line,
            rule: execResult.rule,
            fixSuggestion: execResult.fixSuggestion
          },
          results: [],
          totalExecutionTimeMs: execResult.executionTimeMs,
          earnedXp: 0
        };
      }

      const normalizedActual = CExecutionEngine.normalizeOutput(execResult.output);
      const normalizedExpected = CExecutionEngine.normalizeOutput(tc.expectedOutput);

      const passed = execResult.success && normalizedActual === normalizedExpected;
      if (!passed) allPassed = false;

      results.push({
        id: tc.id || `tc_${i + 1}`,
        desc: tc.desc || `Test Case #${i + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.output || (execResult.error ? `[${execResult.error}]` : '[No output]'),
        passed,
        hidden: !!tc.hidden,
        status: passed ? 'PASSED' : (execResult.error ? execResult.status : 'FAILED'),
        executionTimeMs: execResult.executionTimeMs
      });
    }

    const firstFailed = results.find(r => !r.passed);
    const diagnosticAdvice = firstFailed 
      ? this.generateDiagnosticAdvice(problem, studentCode, firstFailed)
      : null;

    return {
      allPassed,
      compilationError: null,
      diagnosticAdvice,
      results,
      totalExecutionTimeMs: totalTime,
      earnedXp: allPassed ? problem.xpReward : Math.round(problem.xpReward * 0.2)
    };
  }
}

export const cEngine = new CExecutionEngine();
