// GCPP Comprehensive Syllabus Modules & C Programming Problems
// Strictly adhering to Engineering Lab Syllabus (Modules 1 through 6)

export const MODULES = [
  {
    id: 1,
    code: 'MOD-01',
    title: 'Basic Operations & Loops',
    sectorName: 'Terra Genesis',
    coordinates: { x: 260, y: 360 },
    color: '#22c55e',
    accent: '#4ade80',
    fogColor: 'rgba(34, 197, 94, 0.15)',
    description: 'Master arithmetic operations, iterative loops, and fundamental number theory in C.',
    minLevelToUnlock: 1,
    minXpToUnlock: 0,
    icon: 'Sun',
    planetType: 'earth-starter',
    planetImg: '/planets/planet_1_earth.png',
    distanceAu: '0.0 AU'
  },
  {
    id: 2,
    code: 'MOD-02',
    title: 'Conditional Statements',
    sectorName: 'Dune Aegis',
    coordinates: { x: 840, y: 190 },
    color: '#eab308',
    accent: '#fde047',
    fogColor: 'rgba(234, 179, 8, 0.15)',
    description: 'Control program flow using branched conditions, relational operators, and switch selectors.',
    minLevelToUnlock: 2,
    minXpToUnlock: 250,
    icon: 'ShieldAlert',
    planetType: 'desert-dune',
    planetImg: '/planets/planet_2_desert.png',
    distanceAu: '1.4 AU'
  },
  {
    id: 3,
    code: 'MOD-03',
    title: 'Loops & Iteration',
    sectorName: 'Magma Caldera',
    coordinates: { x: 1420, y: 390 },
    color: '#ef4444',
    accent: '#f97316',
    fogColor: 'rgba(239, 68, 68, 0.15)',
    description: 'Forge mastery over nested while, for, and do-while repetition structures in the volcanic core.',
    minLevelToUnlock: 3,
    minXpToUnlock: 550,
    icon: 'Flame',
    planetType: 'volcanic-magma',
    planetImg: '/planets/planet_3_lava.png',
    distanceAu: '2.8 AU'
  },
  {
    id: 4,
    code: 'MOD-04',
    title: 'Functions & Recursion',
    sectorName: 'Glacies Peak',
    coordinates: { x: 2000, y: 200 },
    color: '#06b6d4',
    accent: '#38bdf8',
    fogColor: 'rgba(6, 182, 212, 0.15)',
    description: 'Architect modular programs with procedural abstraction, call stacks, and crystalline recursive self-reference.',
    minLevelToUnlock: 4,
    minXpToUnlock: 950,
    icon: 'RefreshCw',
    planetType: 'frozen-glacier',
    planetImg: '/planets/planet_4_ice.png',
    distanceAu: '4.2 AU'
  },
  {
    id: 5,
    code: 'MOD-05',
    title: 'Arrays & Matrices',
    sectorName: 'Kronos Rings',
    coordinates: { x: 2580, y: 380 },
    color: '#a855f7',
    accent: '#d946ef',
    fogColor: 'rgba(168, 85, 247, 0.15)',
    description: 'Traverse multi-dimensional data arrays, contiguous memory buffers, and planetary ring matrices.',
    minLevelToUnlock: 5,
    minXpToUnlock: 1450,
    icon: 'Grid',
    planetType: 'purple-gas-giant',
    planetImg: '/planets/planet_5_ringed.png',
    distanceAu: '5.6 AU'
  },
  {
    id: 6,
    code: 'MOD-06',
    title: 'Pointers & Low-Level Memory',
    sectorName: 'Cyber Singularity',
    coordinates: { x: 3160, y: 210 },
    color: '#10b981',
    accent: '#00f0ff',
    fogColor: 'rgba(16, 185, 129, 0.15)',
    description: 'Master raw memory addresses, pointer arithmetic, struct memory alignment, and system file descriptors.',
    minLevelToUnlock: 6,
    minXpToUnlock: 2100,
    icon: 'Binary',
    planetType: 'cyber-mech-station',
    planetImg: '/planets/planet_6_cyber.png',
    distanceAu: '7.0 AU'
  }
];

export const PROBLEMS = [
  // ================= MODULE 1: Basic Operations & Loops =================
  {
    id: 'p1_1',
    moduleId: 1,
    title: 'Sum and Average of N Numbers',
    syllabusRef: 'Module 1 - Basic Operations & Loops',
    difficulty: 'Cadet',
    xpReward: 100,
    description: `Write a C program that reads an integer N representing the count of numbers, followed by N integers. Calculate and output their sum and their average formatted to exactly 2 decimal places.

Mathematical Formulation:
Sum = \\sum_{i=1}^{N} X_i
Average = Sum / N`,
    inputFormat: 'The first line contains an integer N (1 <= N <= 1000). The second line contains N space-separated integers.',
    outputFormat: 'Print the sum and average on two separate lines:\nSum = <sum>\nAverage = <average with 2 decimal places>',
    constraints: '1 <= N <= 1000\n-10000 <= Elements <= 10000',
    sampleInput: '5\n10 20 30 40 50',
    sampleOutput: 'Sum = 150\nAverage = 30.00',
    hints: [
      { level: 1, cost: 15, text: 'Use a loop from 0 to N-1 to read each integer and accumulate it in a sum variable initialized to 0.' },
      { level: 2, cost: 30, text: 'Remember to cast sum to float or double when dividing by N: (float)sum / N, and format with %.2f.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Loop N times, read each integer, accumulate sum
    
    // Step 3: Compute average as (float)sum / n
    
    // Step 4: Print results matching format:
    // printf("Sum = %d\\n", sum);
    // printf("Average = %.2f\\n", avg);
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int val;
        scanf("%d", &val);
        sum += val;
    }
    float avg = (float)sum / n;
    printf("Sum = %d\\n", sum);
    printf("Average = %.2f\\n", avg);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '5\n10 20 30 40 50', expectedOutput: 'Sum = 150\nAverage = 30.00', hidden: false, desc: 'Positive sequence' },
      { id: 'tc2', input: '4\n2 5 7 10', expectedOutput: 'Sum = 24\nAverage = 6.00', hidden: false, desc: 'Small integers' },
      { id: 'tc3', input: '3\n-5 0 5', expectedOutput: 'Sum = 0\nAverage = 0.00', hidden: true, desc: 'Negative and zero' },
      { id: 'tc4', input: '1\n99', expectedOutput: 'Sum = 99\nAverage = 99.00', hidden: true, desc: 'Single element' }
    ]
  },
  {
    id: 'p1_2',
    moduleId: 1,
    title: 'Fibonacci Sequence Generator',
    syllabusRef: 'Module 1 - Basic Operations & Loops',
    difficulty: 'Cadet',
    xpReward: 120,
    description: `Generate the first N terms of the Fibonacci sequence starting with 0 and 1.
The Fibonacci sequence satisfies the recurrence relation:
F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n >= 2.`,
    inputFormat: 'A single positive integer N (1 <= N <= 40).',
    outputFormat: 'Print the first N terms of the Fibonacci sequence separated by a single space.',
    constraints: '1 <= N <= 40',
    sampleInput: '7',
    sampleOutput: '0 1 1 2 3 5 8',
    hints: [
      { level: 1, cost: 20, text: 'Store the first two terms a = 0 and b = 1. In each iteration, print current term, next = a + b, then update a = b and b = next.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Generate first N Fibonacci numbers
    // Note: F(0) = 0, F(1) = 1, F(i) = F(i-1) + F(i-2)
    
    // Step 3: Print them space-separated
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        if (i == 0) printf("%lld", a);
        else if (i == 1) printf(" %lld", b);
        else {
            long long c = a + b;
            printf(" %lld", c);
            a = b;
            b = c;
        }
    }
    printf("\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '7', expectedOutput: '0 1 1 2 3 5 8', hidden: false, desc: 'First 7 terms' },
      { id: 'tc2', input: '1', expectedOutput: '0', hidden: false, desc: 'Single term' },
      { id: 'tc3', input: '2', expectedOutput: '0 1', hidden: true, desc: 'First 2 terms' },
      { id: 'tc4', input: '10', expectedOutput: '0 1 1 2 3 5 8 13 21 34', hidden: true, desc: '10 terms' }
    ]
  },
  {
    id: 'p1_3',
    moduleId: 1,
    title: 'Prime Number Verifier',
    syllabusRef: 'Module 1 - Basic Operations & Loops',
    difficulty: 'Cadet',
    xpReward: 130,
    description: `Determine whether a given positive integer N is a Prime number or Not Prime.
A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.`,
    inputFormat: 'A single integer N.',
    outputFormat: 'Print "Prime" if N is prime, otherwise print "Not Prime".',
    constraints: '1 <= N <= 10^7',
    sampleInput: '29',
    sampleOutput: 'Prime',
    hints: [
      { level: 1, cost: 20, text: 'Numbers less than or equal to 1 are not prime. Test divisibility up to sqrt(N) or i*i <= N.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Check prime condition (n > 1 and no factors from 2 to sqrt(n))
    
    // Step 3: Print "Prime" or "Not Prime"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n <= 1) {
        printf("Not Prime\\n");
        return 0;
    }
    int isPrime = 1;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = 0;
            break;
        }
    }
    if (isPrime) printf("Prime\\n");
    else printf("Not Prime\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '29', expectedOutput: 'Prime', hidden: false, desc: 'Standard prime' },
      { id: 'tc2', input: '1', expectedOutput: 'Not Prime', hidden: false, desc: 'Edge case 1' },
      { id: 'tc3', input: '2', expectedOutput: 'Prime', hidden: true, desc: 'Smallest prime' },
      { id: 'tc4', input: '49', expectedOutput: 'Not Prime', hidden: true, desc: 'Composite square' }
    ]
  },
  {
    id: 'p1_4',
    moduleId: 1,
    title: 'Armstrong Number Checker',
    syllabusRef: 'Module 1 - Basic Operations & Loops',
    difficulty: 'Cadet',
    xpReward: 140,
    description: `An Armstrong number (narcissistic number) for a 3-digit number is an integer such that the sum of the cubes of its digits equals the number itself (e.g. 153 = 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153). Write a C program to check whether a given integer N is an Armstrong number.`,
    inputFormat: 'A positive integer N.',
    outputFormat: 'Print "Armstrong" if N is an Armstrong number, otherwise print "Not Armstrong".',
    constraints: '100 <= N <= 999',
    sampleInput: '153',
    sampleOutput: 'Armstrong',
    hints: [
      { level: 1, cost: 25, text: 'Extract digits using n % 10 and update n = n / 10. Cube each digit (d * d * d) and accumulate.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Extract each digit (n % 10), cube it, and sum
    
    // Step 3: Compare sum with original number
    // Print "Armstrong" or "Not Armstrong"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n, original, remainder, result = 0;
    scanf("%d", &n);
    original = n;
    while (original != 0) {
        remainder = original % 10;
        result += remainder * remainder * remainder;
        original /= 10;
    }
    if (result == n) printf("Armstrong\\n");
    else printf("Not Armstrong\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '153', expectedOutput: 'Armstrong', hidden: false, desc: '153 is Armstrong' },
      { id: 'tc2', input: '370', expectedOutput: 'Armstrong', hidden: false, desc: '370 is Armstrong' },
      { id: 'tc3', input: '123', expectedOutput: 'Not Armstrong', hidden: true, desc: '123 is not' },
      { id: 'tc4', input: '371', expectedOutput: 'Armstrong', hidden: true, desc: '371 is Armstrong' }
    ]
  },
  {
    id: 'p1_5',
    moduleId: 1,
    title: 'Perfect and Strong Number Analyzer',
    syllabusRef: 'Module 1 - Basic Operations & Loops',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Given a positive integer N:
1. A Perfect number is equal to the sum of its proper positive divisors (excluding itself, e.g. 6 = 1 + 2 + 3).
2. A Strong number is equal to the sum of the factorials of its digits (e.g. 145 = 1! + 4! + 5! = 1 + 24 + 120 = 145).
Evaluate N and print whether it is "Perfect", "Strong", "Both", or "Neither".`,
    inputFormat: 'A positive integer N.',
    outputFormat: 'Print "Perfect", "Strong", "Both", or "Neither".',
    constraints: '1 <= N <= 100000',
    sampleInput: '6',
    sampleOutput: 'Perfect',
    hints: [
      { level: 1, cost: 25, text: 'Calculate divisor sum up to N/2. Calculate digit factorial sum by isolating digits.' }
    ],
    starterCode: `#include <stdio.h>

// Helper to compute digit factorial
long long fact(int d) {
    long long f = 1;
    for (int i = 1; i <= d; i++) f *= i;
    return f;
}

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Check if Perfect (sum of proper divisors == n)
    
    // Step 3: Check if Strong (sum of factorials of digits == n)
    
    // Step 4: Print "Both", "Perfect", "Strong", or "Neither"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

long long fact(int d) {
    long long f = 1;
    for (int i = 1; i <= d; i++) f *= i;
    return f;
}

int main() {
    int n;
    scanf("%d", &n);
    int divSum = 0;
    for (int i = 1; i <= n / 2; i++) {
        if (n % i == 0) divSum += i;
    }
    int isPerfect = (divSum == n);
    
    int temp = n;
    long long factSum = 0;
    while (temp > 0) {
        factSum += fact(temp % 10);
        temp /= 10;
    }
    int isStrong = (factSum == n);
    
    if (isPerfect && isStrong) printf("Both\\n");
    else if (isPerfect) printf("Perfect\\n");
    else if (isStrong) printf("Strong\\n");
    else printf("Neither\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '6', expectedOutput: 'Perfect', hidden: false, desc: '6 is perfect' },
      { id: 'tc2', input: '145', expectedOutput: 'Strong', hidden: false, desc: '145 is strong' },
      { id: 'tc3', input: '28', expectedOutput: 'Perfect', hidden: true, desc: '28 is perfect' },
      { id: 'tc4', input: '12', expectedOutput: 'Neither', hidden: true, desc: 'Neither' }
    ]
  },

  // ================= MODULE 2: Conditional Statements =================
  {
    id: 'p2_1',
    moduleId: 2,
    title: 'Roots of a Quadratic Equation',
    syllabusRef: 'Module 2 - Conditional Statements',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Compute the roots of the quadratic equation: ax^2 + bx + c = 0.
Calculate the discriminant: D = b^2 - 4ac.
- If D > 0: roots are real and distinct. Print:
  Roots are real and distinct: <root1> <root2> (format with 2 decimal places, root1 >= root2)
- If D == 0: roots are real and equal. Print:
  Roots are real and equal: <root> <root> (format with 2 decimal places)
- If D < 0: roots are complex. Print:
  Roots are complex: <real> + <imag>i and <real> - <imag>i (both real and imag formatted to 2 decimals)`,
    inputFormat: 'Three coefficients a, b, and c separated by spaces (a != 0).',
    outputFormat: 'Print the specified string according to the nature of roots.',
    constraints: 'a != 0, -100 <= a, b, c <= 100',
    sampleInput: '1 -5 6',
    sampleOutput: 'Roots are real and distinct: 3.00 2.00',
    hints: [
      { level: 1, cost: 20, text: 'Use sqrt() from <math.h>. Discriminant is d = b*b - 4*a*c.' }
    ],
    starterCode: `#include <stdio.h>
#include <math.h>

int main() {
    double a, b, c;
    // Step 1: Read a, b, c
    
    // Step 2: Compute discriminant D = b*b - 4*a*c
    
    // Step 3: Branch for D > 0, D == 0, and D < 0 and print formatted roots
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <math.h>

int main() {
    double a, b, c;
    scanf("%lf %lf %lf", &a, &b, &c);
    double d = b * b - 4 * a * c;
    if (d > 0) {
        double r1 = (-b + sqrt(d)) / (2 * a);
        double r2 = (-b - sqrt(d)) / (2 * a);
        if (r1 < r2) { double t = r1; r1 = r2; r2 = t; }
        printf("Roots are real and distinct: %.2f %.2f\\n", r1, r2);
    } else if (d == 0) {
        double r = -b / (2 * a);
        printf("Roots are real and equal: %.2f %.2f\\n", r, r);
    } else {
        double realPart = -b / (2 * a);
        double imagPart = sqrt(-d) / (2 * a);
        if (imagPart < 0) imagPart = -imagPart;
        printf("Roots are complex: %.2f + %.2fi and %.2f - %.2fi\\n", realPart, imagPart, realPart, imagPart);
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '1 -5 6', expectedOutput: 'Roots are real and distinct: 3.00 2.00', hidden: false, desc: 'Real distinct' },
      { id: 'tc2', input: '1 -4 4', expectedOutput: 'Roots are real and equal: 2.00 2.00', hidden: false, desc: 'Real equal' },
      { id: 'tc3', input: '1 2 5', expectedOutput: 'Roots are complex: -1.00 + 2.00i and -1.00 - 2.00i', hidden: true, desc: 'Complex roots' }
    ]
  },
  {
    id: 'p2_2',
    moduleId: 2,
    title: 'Switch Statement Arithmetic Calculator',
    syllabusRef: 'Module 2 - Conditional Statements',
    difficulty: 'Cadet',
    xpReward: 140,
    description: `Construct an interactive command calculator using the switch-case construct in C.
The calculator reads an operator (+, -, *, /, %) followed by two integer operands A and B.
- For +, -, *: perform normal integer arithmetic.
- For /: if B == 0 print "Error: Division by zero", otherwise print integer quotient.
- For %: if B == 0 print "Error: Division by zero", otherwise print remainder.
- For invalid operator: print "Error: Invalid operator".`,
    inputFormat: 'A character operator (+, -, *, /, %) followed by two integers A and B.',
    outputFormat: 'Print the computed integer result or error message.',
    constraints: '-10000 <= A, B <= 10000',
    sampleInput: '+ 15 25',
    sampleOutput: '40',
    hints: [
      { level: 1, cost: 15, text: 'Use scanf(" %c %d %d", &op, &a, &b) with a leading space before %c to ignore whitespace.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    char op;
    int a, b;
    // Step 1: Read operator and operands: scanf(" %c %d %d", &op, &a, &b)
    
    // Step 2: Use switch(op) to handle '+', '-', '*', '/', '%' and default
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    char op;
    int a, b;
    if (scanf(" %c %d %d", &op, &a, &b) != 3) return 0;
    switch (op) {
        case '+': printf("%d\\n", a + b); break;
        case '-': printf("%d\\n", a - b); break;
        case '*': printf("%d\\n", a * b); break;
        case '/':
            if (b == 0) printf("Error: Division by zero\\n");
            else printf("%d\\n", a / b);
            break;
        case '%':
            if (b == 0) printf("Error: Division by zero\\n");
            else printf("%d\\n", a % b);
            break;
        default: printf("Error: Invalid operator\\n");
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '+ 15 25', expectedOutput: '40', hidden: false, desc: 'Addition' },
      { id: 'tc2', input: '* 7 8', expectedOutput: '56', hidden: false, desc: 'Multiplication' },
      { id: 'tc3', input: '/ 10 0', expectedOutput: 'Error: Division by zero', hidden: true, desc: 'Divide by zero' },
      { id: 'tc4', input: '% 17 5', expectedOutput: '2', hidden: true, desc: 'Modulo' },
      { id: 'tc5', input: '^ 2 3', expectedOutput: 'Error: Invalid operator', hidden: true, desc: 'Invalid op' }
    ]
  },

  // ================= MODULE 3: Functions & Recursion =================
  {
    id: 'p3_1',
    moduleId: 3,
    title: 'Factorial: Recursive and Non-Recursive',
    syllabusRef: 'Module 3 - Functions & Recursion',
    difficulty: 'Cadet',
    xpReward: 150,
    description: `Implement two functions to compute the factorial of an integer N:
1. long long fact_iterative(int n)
2. long long fact_recursive(int n)

Print the results of both approaches on two separate lines:
Iterative: <result>
Recursive: <result>`,
    inputFormat: 'A non-negative integer N (0 <= N <= 20).',
    outputFormat: 'Print:\nIterative: <val>\nRecursive: <val>',
    constraints: '0 <= N <= 20',
    sampleInput: '5',
    sampleOutput: 'Iterative: 120\nRecursive: 120',
    hints: [
      { level: 1, cost: 20, text: 'Base case for recursion: if (n <= 1) return 1; otherwise return n * fact_recursive(n - 1);' }
    ],
    starterCode: `#include <stdio.h>

// Step 1: Implement iterative factorial
long long fact_iterative(int n) {
    // Write your code here
}

// Step 2: Implement recursive factorial
long long fact_recursive(int n) {
    // Write your code here
}

int main() {
    int n;
    scanf("%d", &n);
    printf("Iterative: %lld\\n", fact_iterative(n));
    printf("Recursive: %lld\\n", fact_recursive(n));
    return 0;
}`,
    solutionCode: `#include <stdio.h>

long long fact_iterative(int n) {
    long long res = 1;
    for (int i = 2; i <= n; i++) res *= i;
    return res;
}

long long fact_recursive(int n) {
    if (n <= 1) return 1;
    return n * fact_recursive(n - 1);
}

int main() {
    int n;
    scanf("%d", &n);
    printf("Iterative: %lld\\n", fact_iterative(n));
    printf("Recursive: %lld\\n", fact_recursive(n));
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '5', expectedOutput: 'Iterative: 120\nRecursive: 120', hidden: false, desc: 'Factorial of 5' },
      { id: 'tc2', input: '0', expectedOutput: 'Iterative: 1\nRecursive: 1', hidden: false, desc: 'Factorial of 0' },
      { id: 'tc3', input: '7', expectedOutput: 'Iterative: 5040\nRecursive: 5040', hidden: true, desc: 'Factorial of 7' }
    ]
  },
  {
    id: 'p3_2',
    moduleId: 3,
    title: 'Greatest Common Divisor (GCD)',
    syllabusRef: 'Module 3 - Functions & Recursion',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Compute the Greatest Common Divisor (GCD) of two positive integers A and B using the Euclidean algorithm with both recursive and non-recursive techniques.
Print:
Iterative GCD: <val>
Recursive GCD: <val>`,
    inputFormat: 'Two space-separated integers A and B (1 <= A, B <= 10^9).',
    outputFormat: 'Print:\nIterative GCD: <val>\nRecursive GCD: <val>',
    constraints: '1 <= A, B <= 10^9',
    sampleInput: '48 18',
    sampleOutput: 'Iterative GCD: 6\nRecursive GCD: 6',
    hints: [
      { level: 1, cost: 20, text: 'Euclidean property: gcd(a, b) = gcd(b, a % b). When b becomes 0, the answer is a.' }
    ],
    starterCode: `#include <stdio.h>

// Step 1: Implement iterative GCD using while loop
int gcd_iterative(int a, int b) {
    // Write your code here
}

// Step 2: Implement recursive GCD
int gcd_recursive(int a, int b) {
    // Write your code here
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Iterative GCD: %d\\n", gcd_iterative(a, b));
    printf("Recursive GCD: %d\\n", gcd_recursive(a, b));
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int gcd_iterative(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int gcd_recursive(int a, int b) {
    if (b == 0) return a;
    return gcd_recursive(b, a % b);
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Iterative GCD: %d\\n", gcd_iterative(a, b));
    printf("Recursive GCD: %d\\n", gcd_recursive(a, b));
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '48 18', expectedOutput: 'Iterative GCD: 6\nRecursive GCD: 6', hidden: false, desc: 'Standard GCD' },
      { id: 'tc2', input: '17 19', expectedOutput: 'Iterative GCD: 1\nRecursive GCD: 1', hidden: false, desc: 'Co-prime' },
      { id: 'tc3', input: '100 25', expectedOutput: 'Iterative GCD: 25\nRecursive GCD: 25', hidden: true, desc: 'Multiples' }
    ]
  },

  // ================= MODULE 4: Arrays & Matrices =================
  {
    id: 'p4_1',
    moduleId: 4,
    title: 'Find Min and Max in an Array',
    syllabusRef: 'Module 4 - Arrays & Matrices',
    difficulty: 'Cadet',
    xpReward: 140,
    description: `Given an array of N integers, find the minimum and maximum elements using a single linear scan.`,
    inputFormat: 'First line contains integer N (1 <= N <= 1000). Second line contains N integers.',
    outputFormat: 'Minimum = <min>\nMaximum = <max>',
    constraints: '1 <= N <= 1000',
    sampleInput: '6\n14 3 -5 88 12 0',
    sampleOutput: 'Minimum = -5\nMaximum = 88',
    hints: [
      { level: 1, cost: 15, text: 'Initialize min and max with arr[0], then iterate from index 1 to N-1 updating them.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N and the array elements
    
    // Step 2: Linear scan to find min and max
    
    // Step 3: Print Minimum and Maximum
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[1005];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    int minVal = arr[0];
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] < minVal) minVal = arr[i];
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    printf("Minimum = %d\\n", minVal);
    printf("Maximum = %d\\n", maxVal);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '6\n14 3 -5 88 12 0', expectedOutput: 'Minimum = -5\nMaximum = 88', hidden: false, desc: 'Standard array' },
      { id: 'tc2', input: '1\n42', expectedOutput: 'Minimum = 42\nMaximum = 42', hidden: false, desc: 'Single element' },
      { id: 'tc3', input: '4\n-10 -20 -30 -5', expectedOutput: 'Minimum = -30\nMaximum = -5', hidden: true, desc: 'All negative' }
    ]
  },
  {
    id: 'p4_2',
    moduleId: 4,
    title: 'Ascending Order Sort',
    syllabusRef: 'Module 4 - Arrays & Matrices',
    difficulty: 'Cadet',
    xpReward: 150,
    description: `Read an array of N integers and sort them in non-decreasing (ascending) order using Bubble Sort or Selection Sort.`,
    inputFormat: 'First line contains integer N. Second line contains N integers.',
    outputFormat: 'Sorted array elements separated by single spaces.',
    constraints: '1 <= N <= 500',
    sampleInput: '5\n64 25 12 22 11',
    sampleOutput: '11 12 22 25 64',
    hints: [
      { level: 1, cost: 20, text: 'Use nested loops: for i from 0 to n-1, for j from 0 to n-i-2, swap if arr[j] > arr[j+1].' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N and elements
    
    // Step 2: Implement Bubble or Selection sort
    
    // Step 3: Print sorted array space-separated
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[505];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", arr[i]);
    }
    printf("\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '5\n64 25 12 22 11', expectedOutput: '11 12 22 25 64', hidden: false, desc: 'Unsorted 5 elements' },
      { id: 'tc2', input: '4\n4 3 2 1', expectedOutput: '1 2 3 4', hidden: false, desc: 'Reverse sorted' },
      { id: 'tc3', input: '3\n5 5 5', expectedOutput: '5 5 5', hidden: true, desc: 'Identical' }
    ]
  },
  {
    id: 'p4_3',
    moduleId: 4,
    title: 'Symmetric Matrix Check',
    syllabusRef: 'Module 4 - Arrays & Matrices',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Check if a given square matrix of size N x N is symmetric. A matrix is symmetric if A[i][j] == A[j][i] for all 0 <= i, j < N.`,
    inputFormat: 'The first line contains integer N. The next N lines contain N space-separated integers.',
    outputFormat: 'Print "Symmetric" if the matrix is symmetric, otherwise print "Not Symmetric".',
    constraints: '1 <= N <= 20',
    sampleInput: '3\n1 2 3\n2 4 5\n3 5 6',
    sampleOutput: 'Symmetric',
    hints: [
      { level: 1, cost: 20, text: 'Check if A[i][j] != A[j][i]. If any pair mismatches, mark symmetric as 0 and break.' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N and the N x N matrix
    
    // Step 2: Check if A[i][j] == A[j][i] for all i, j
    
    // Step 3: Print "Symmetric" or "Not Symmetric"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int mat[25][25];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &mat[i][j]);
        }
    }
    int isSymmetric = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (mat[i][j] != mat[j][i]) {
                isSymmetric = 0;
                break;
            }
        }
        if (!isSymmetric) break;
    }
    if (isSymmetric) printf("Symmetric\\n");
    else printf("Not Symmetric\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '3\n1 2 3\n2 4 5\n3 5 6', expectedOutput: 'Symmetric', hidden: false, desc: '3x3 Symmetric' },
      { id: 'tc2', input: '2\n1 2\n3 4', expectedOutput: 'Not Symmetric', hidden: false, desc: '2x2 Asymmetric' },
      { id: 'tc3', input: '1\n99', expectedOutput: 'Symmetric', hidden: true, desc: '1x1 Matrix' }
    ]
  },
  {
    id: 'p4_4',
    moduleId: 4,
    title: 'Matrix Addition and Multiplication',
    syllabusRef: 'Module 4 - Arrays & Matrices',
    difficulty: 'Commander',
    xpReward: 200,
    description: `Given two matrices A and B of size R x C:
First output their Sum matrix (R x C).
Then, if R == C, output their Product matrix A x B (R x C). If R != C, output "Multiplication Not Possible".`,
    inputFormat: 'First line: integers R and C. Next R lines: Matrix A. Next R lines: Matrix B.',
    outputFormat: 'Print "Sum Matrix:" followed by R rows. Then print "Product Matrix:" followed by R rows (or "Multiplication Not Possible").',
    constraints: '1 <= R, C <= 10',
    sampleInput: '2 2\n1 2\n3 4\n5 6\n7 8',
    sampleOutput: 'Sum Matrix:\n6 8\n10 12\nProduct Matrix:\n19 22\n43 50',
    hints: [
      { level: 1, cost: 30, text: 'Product formula: C[i][j] = sum over k of A[i][k] * B[k][j].' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int r, c;
    // Step 1: Read R and C, then Matrix A, then Matrix B
    
    // Step 2: Output "Sum Matrix:" followed by A + B
    
    // Step 3: If r == c, output "Product Matrix:" followed by A * B
    // Else output "Multiplication Not Possible"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int r, c;
    scanf("%d %d", &r, &c);
    int a[15][15], b[15][15];
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            scanf("%d", &a[i][j]);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            scanf("%d", &b[i][j]);
    printf("Sum Matrix:\\n");
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (j > 0) printf(" ");
            printf("%d", a[i][j] + b[i][j]);
        }
        printf("\\n");
    }
    if (r == c) {
        printf("Product Matrix:\\n");
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                int sum = 0;
                for (int k = 0; k < c; k++) sum += a[i][k] * b[k][j];
                if (j > 0) printf(" ");
                printf("%d", sum);
            }
            printf("\\n");
        }
    } else {
        printf("Multiplication Not Possible\\n");
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '2 2\n1 2\n3 4\n5 6\n7 8', expectedOutput: 'Sum Matrix:\n6 8\n10 12\nProduct Matrix:\n19 22\n43 50', hidden: false, desc: '2x2 square' },
      { id: 'tc2', input: '2 3\n1 2 3\n4 5 6\n1 1 1\n2 2 2', expectedOutput: 'Sum Matrix:\n2 3 4\n6 7 8\nMultiplication Not Possible', hidden: false, desc: 'Rectangular' }
    ]
  },

  // ================= MODULE 5: Strings & Pointers =================
  {
    id: 'p5_1',
    moduleId: 5,
    title: 'Substring Insertion into a String',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Insert a given substring into a main string at a specified 0-based position POS.
If POS is greater than the main string length, append it at the end.`,
    inputFormat: 'First line: main string (no spaces).\nSecond line: substring (no spaces).\nThird line: integer POS.',
    outputFormat: 'Print the resulting merged string.',
    constraints: 'String lengths <= 200',
    sampleInput: 'HelloSpace\nDeep\n5',
    sampleOutput: 'HelloDeepSpace',
    hints: [
      { level: 1, cost: 20, text: 'Copy characters up to POS, copy the substring, then copy remaining characters from POS to end.' }
    ],
    starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[500], sub[250], res[750];
    int pos;
    // Step 1: Read str, sub, and pos
    
    // Step 2: Insert sub into str at pos
    
    // Step 3: Print result
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[500], sub[250], res[750];
    int pos;
    scanf("%s", str);
    scanf("%s", sub);
    scanf("%d", &pos);
    int len = strlen(str);
    if (pos > len) pos = len;
    int idx = 0;
    for (int i = 0; i < pos; i++) res[idx++] = str[i];
    for (int i = 0; sub[i] != '\\0'; i++) res[idx++] = sub[i];
    for (int i = pos; i < len; i++) res[idx++] = str[i];
    res[idx] = '\\0';
    printf("%s\\n", res);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: 'HelloSpace\nDeep\n5', expectedOutput: 'HelloDeepSpace', hidden: false, desc: 'Mid insertion' },
      { id: 'tc2', input: 'World\nHello\n0', expectedOutput: 'HelloWorld', hidden: false, desc: 'Prefix insertion' }
    ]
  },
  {
    id: 'p5_2',
    moduleId: 5,
    title: 'Call by Value vs Call by Reference (Pointers)',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Cadet',
    xpReward: 150,
    description: `Demonstrate the distinction between Call by Value and Call by Reference.
Implement two functions:
1. void swapByValue(int a, int b) -> attempts swapping copies
2. void swapByReference(int *a, int *b) -> swaps actual values via dereferencing pointers
Given initial values A and B, call swapByValue, print values, then call swapByReference, and print values.`,
    inputFormat: 'Two space-separated integers A and B.',
    outputFormat: 'After Call by Value: <a_val> <b_val>\nAfter Call by Reference: <b_val> <a_val>',
    constraints: '-10000 <= A, B <= 10000',
    sampleInput: '10 20',
    sampleOutput: 'After Call by Value: 10 20\nAfter Call by Reference: 20 10',
    hints: [
      { level: 1, cost: 15, text: 'In call by reference, pass &a and &b. In swapByReference, use int temp = *a; *a = *b; *b = temp;' }
    ],
    starterCode: `#include <stdio.h>

void swapByValue(int a, int b) {
    // Write swap by value
}

void swapByReference(int *a, int *b) {
    // Write swap by reference using pointer dereferencing
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    
    swapByValue(a, b);
    printf("After Call by Value: %d %d\\n", a, b);
    
    swapByReference(&a, &b);
    printf("After Call by Reference: %d %d\\n", a, b);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

void swapByValue(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

void swapByReference(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    swapByValue(a, b);
    printf("After Call by Value: %d %d\\n", a, b);
    swapByReference(&a, &b);
    printf("After Call by Reference: %d %d\\n", a, b);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '10 20', expectedOutput: 'After Call by Value: 10 20\nAfter Call by Reference: 20 10', hidden: false, desc: 'Standard 10 20' },
      { id: 'tc2', input: '-5 15', expectedOutput: 'After Call by Value: -5 15\nAfter Call by Reference: 15 -5', hidden: true, desc: 'Negative values' }
    ]
  },
  {
    id: 'p5_3',
    moduleId: 5,
    title: 'Palindrome String Checker',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Cadet',
    xpReward: 140,
    description: `Check whether a given string is a Palindrome (reads the same forwards and backwards).`,
    inputFormat: 'A single word string (lowercase).',
    outputFormat: 'Print "Palindrome" or "Not Palindrome".',
    constraints: 'Length <= 100',
    sampleInput: 'racecar',
    sampleOutput: 'Palindrome',
    hints: [
      { level: 1, cost: 15, text: 'Use two pointers/indices: left = 0, right = len - 1. Compare chars while moving inward.' }
    ],
    starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[105];
    // Step 1: Read str
    
    // Step 2: Check if palindrome (str[i] == str[len - 1 - i])
    
    // Step 3: Print "Palindrome" or "Not Palindrome"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[105];
    scanf("%s", str);
    int left = 0;
    int right = strlen(str) - 1;
    int isPal = 1;
    while (left < right) {
        if (str[left] != str[right]) {
            isPal = 0;
            break;
        }
        left++;
        right--;
    }
    if (isPal) printf("Palindrome\\n");
    else printf("Not Palindrome\\n");
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: 'racecar', expectedOutput: 'Palindrome', hidden: false, desc: 'racecar' },
      { id: 'tc2', input: 'cosmic', expectedOutput: 'Not Palindrome', hidden: false, desc: 'cosmic' },
      { id: 'tc3', input: 'a', expectedOutput: 'Palindrome', hidden: true, desc: 'single character' }
    ]
  },
  {
    id: 'p5_4',
    moduleId: 5,
    title: 'Substring Index Search',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Explorer',
    xpReward: 160,
    description: `Find the 0-based starting index of the first occurrence of substring SUB in main string STR.
If SUB is not present, print -1.`,
    inputFormat: 'Line 1: Main string STR.\nLine 2: Target substring SUB.',
    outputFormat: 'Print the 0-based starting index or -1.',
    constraints: 'Lengths <= 200',
    sampleInput: 'starshiporbit\nship',
    sampleOutput: '4',
    hints: [
      { level: 1, cost: 20, text: 'Use nested loop or strstr() to locate the substring.' }
    ],
    starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[205], sub[205];
    // Step 1: Read str and sub
    
    // Step 2: Locate first occurrence index (or -1 if not found)
    
    // Step 3: Print index
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[205], sub[205];
    scanf("%s", str);
    scanf("%s", sub);
    char *ptr = strstr(str, sub);
    if (ptr != NULL) {
        printf("%ld\\n", ptr - str);
    } else {
        printf("-1\\n");
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: 'starshiporbit\nship', expectedOutput: '4', hidden: false, desc: 'Found in middle' },
      { id: 'tc2', input: 'galaxy\nspace', expectedOutput: '-1', hidden: false, desc: 'Not found' }
    ]
  },
  {
    id: 'p5_5',
    moduleId: 5,
    title: 'Line, Word, and Character Counter',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Explorer',
    xpReward: 170,
    description: `Read text until end of input and count the total number of lines, words, and characters.
Words are separated by spaces, tabs, or newlines.`,
    inputFormat: 'A stream of text ending with EOF.',
    outputFormat: 'Lines: <line_count>\nWords: <word_count>\nCharacters: <char_count>',
    constraints: 'Input up to 1000 characters.',
    sampleInput: 'Deep space mission\nAll systems operational\n',
    sampleOutput: 'Lines: 2\nWords: 6\nCharacters: 43',
    hints: [
      { level: 1, cost: 25, text: 'Track inWord flag. When transitioning from whitespace to non-whitespace, increment words.' }
    ],
    starterCode: `#include <stdio.h>
#include <ctype.h>

int main() {
    int c;
    int lines = 0, words = 0, chars = 0;
    // Step 1: Read character by character: while ((c = getchar()) != EOF)
    
    // Step 2: Count characters, newlines, and words
    
    // Step 3: Print formatted counts
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <ctype.h>

int main() {
    int c;
    int lines = 0, words = 0, chars = 0;
    int inWord = 0;
    while ((c = getchar()) != EOF) {
        chars++;
        if (c == '\\n') lines++;
        if (isspace(c)) {
            inWord = 0;
        } else if (!inWord) {
            inWord = 1;
            words++;
        }
    }
    if (chars > 0 && lines == 0) lines = 1;
    printf("Lines: %d\\n", lines);
    printf("Words: %d\\n", words);
    printf("Characters: %d\\n", chars);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: 'Deep space mission\nAll systems operational\n', expectedOutput: 'Lines: 2\nWords: 6\nCharacters: 43', hidden: false, desc: 'Two lines' }
    ]
  },
  {
    id: 'p5_6',
    moduleId: 5,
    title: 'Pointer Array Summation',
    syllabusRef: 'Module 5 - Strings & Pointers',
    difficulty: 'Cadet',
    xpReward: 150,
    description: `Compute the sum of elements in an array using pointer arithmetic (*(ptr + i) or ptr++), without direct array subscript notation.`,
    inputFormat: 'First line contains N. Second line contains N space-separated integers.',
    outputFormat: 'Sum = <sum>',
    constraints: '1 <= N <= 1000',
    sampleInput: '4\n10 20 30 40',
    sampleOutput: 'Sum = 100',
    hints: [
      { level: 1, cost: 15, text: 'Assign int *ptr = arr; then sum += *(ptr + i);' }
    ],
    starterCode: `#include <stdio.h>

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Read elements using pointer arithmetic
    
    // Step 3: Calculate sum using *(ptr + i)
    
    // Step 4: Print "Sum = %d\\n", sum
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[1005];
    int *ptr = arr;
    for (int i = 0; i < n; i++) scanf("%d", ptr + i);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += *(ptr + i);
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '4\n10 20 30 40', expectedOutput: 'Sum = 100', hidden: false, desc: '4 items' },
      { id: 'tc2', input: '3\n-5 15 20', expectedOutput: 'Sum = 30', hidden: false, desc: 'Includes negative' }
    ]
  },

  // ================= MODULE 6: Structures & File Handling =================
  {
    id: 'p6_1',
    moduleId: 6,
    title: 'Student Marks Calculation via Structure',
    syllabusRef: 'Module 6 - Structures & File Handling',
    difficulty: 'Explorer',
    xpReward: 180,
    description: `Define a structure 'Student' containing:
- rollNo (int)
- name (string without spaces)
- marks[3] (3 integer subject marks)
- total (int)
- percentage (float)
Read data for N students. For each student, compute total and percentage (total / 3.0).
Determine if the student "Passed" (percentage >= 40.0 and each subject >= 35) or "Failed".`,
    inputFormat: 'First line: N (number of students).\nNext N lines: <rollNo> <name> <m1> <m2> <m3>',
    outputFormat: 'For each student on a new line:\n<rollNo> <name> Total: <total> Percentage: <percentage formatted to 2 decimals> Status: <Passed/Failed>',
    constraints: '1 <= N <= 50, marks between 0 and 100',
    sampleInput: '2\n101 Alice 85 90 78\n102 Bob 30 50 60',
    sampleOutput: '101 Alice Total: 253 Percentage: 84.33 Status: Passed\n102 Bob Total: 140 Percentage: 46.67 Status: Failed',
    hints: [
      { level: 1, cost: 25, text: 'Check individual subject marks >= 35 and average >= 40 for Pass condition.' }
    ],
    starterCode: `#include <stdio.h>

struct Student {
    int rollNo;
    char name[50];
    int marks[3];
    int total;
    float percentage;
};

int main() {
    int n;
    // Step 1: Read N
    
    // Step 2: Loop through each student, read details, compute total & percentage
    
    // Step 3: Check pass criteria (each mark >= 35 and percentage >= 40.0)
    
    // Step 4: Print details matching output format
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

struct Student {
    int rollNo;
    char name[50];
    int marks[3];
    int total;
    float percentage;
};

int main() {
    int n;
    scanf("%d", &n);
    struct Student s[55];
    for (int i = 0; i < n; i++) {
        scanf("%d %s %d %d %d", &s[i].rollNo, s[i].name, &s[i].marks[0], &s[i].marks[1], &s[i].marks[2]);
        s[i].total = s[i].marks[0] + s[i].marks[1] + s[i].marks[2];
        s[i].percentage = (float)s[i].total / 3.0f;
        int passed = (s[i].marks[0] >= 35 && s[i].marks[1] >= 35 && s[i].marks[2] >= 35 && s[i].percentage >= 40.0f);
        printf("%d %s Total: %d Percentage: %.2f Status: %s\\n",
            s[i].rollNo, s[i].name, s[i].total, s[i].percentage, passed ? "Passed" : "Failed");
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '2\n101 Alice 85 90 78\n102 Bob 30 50 60', expectedOutput: '101 Alice Total: 253 Percentage: 84.33 Status: Passed\n102 Bob Total: 140 Percentage: 46.67 Status: Failed', hidden: false, desc: 'Alice passed, Bob failed 1 subject' }
    ]
  },
  {
    id: 'p6_2',
    moduleId: 6,
    title: 'File Data Processing and Analysis',
    syllabusRef: 'Module 6 - Structures & File Handling',
    difficulty: 'Commander',
    xpReward: 200,
    description: `Demonstrate reading sequential records from a formatted data stream (simulating file operations).
Read N data records containing (ItemID, Quantity, UnitPrice).
Calculate the total inventory valuation and find the record with the maximum value (Quantity * UnitPrice).`,
    inputFormat: 'First line: integer N.\nNext N lines: <ItemID> <Quantity> <UnitPrice>',
    outputFormat: 'Total Valuation = <sum formatted to 2 decimals>\nHighest Value Item: <ItemID> (<value formatted to 2 decimals>)',
    constraints: '1 <= N <= 100',
    sampleInput: '3\nITEM101 5 120.50\nITEM102 20 15.00\nITEM103 2 450.00',
    sampleOutput: 'Total Valuation = 1802.50\nHighest Value Item: ITEM103 (900.00)',
    hints: [
      { level: 1, cost: 30, text: 'Keep a running sum of qty * price, and track max item ID and max amount.' }
    ],
    starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    // Step 1: Read count of records N
    
    // Step 2: Read each record (item, qty, price), compute valuation and track highest
    
    // Step 3: Print Total Valuation and Highest Value Item
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    scanf("%d", &n);
    double totalValuation = 0.0;
    char maxItem[50] = "";
    double maxVal = -1.0;
    for (int i = 0; i < n; i++) {
        char item[50];
        int qty;
        double price;
        scanf("%s %d %lf", item, &qty, &price);
        double val = qty * price;
        totalValuation += val;
        if (val > maxVal) {
            maxVal = val;
            strcpy(maxItem, item);
        }
    }
    printf("Total Valuation = %.2f\\n", totalValuation);
    printf("Highest Value Item: %s (%.2f)\\n", maxItem, maxVal);
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '3\nITEM101 5 120.50\nITEM102 20 15.00\nITEM103 2 450.00', expectedOutput: 'Total Valuation = 1802.50\nHighest Value Item: ITEM103 (900.00)', hidden: false, desc: 'Standard records' }
    ]
  }
];

export const ASTRONAUT_RANKS = [
  { level: 1, title: 'Space Cadet', xpRequired: 0, badge: '🚀' },
  { level: 2, title: 'Orbital Navigator', xpRequired: 250, badge: '🛰️' },
  { level: 3, title: 'Flight Engineer', xpRequired: 550, badge: '⚡' },
  { level: 4, title: 'Cosmic Voyager', xpRequired: 950, badge: '🪐' },
  { level: 5, title: 'Quantum Specialist', xpRequired: 1450, badge: '🌌' },
  { level: 6, title: 'Mission Commander', xpRequired: 2100, badge: '⭐' },
  { level: 7, title: 'Galactic Grandmaster', xpRequired: 2800, badge: '👑' }
];

export function getRankForXp(xp) {
  let currentRank = ASTRONAUT_RANKS[0];
  for (let rank of ASTRONAUT_RANKS) {
    if (xp >= rank.xpRequired) currentRank = rank;
    else break;
  }
  return currentRank;
}

export function getNextRank(currentLevel) {
  return ASTRONAUT_RANKS.find(r => r.level === currentLevel + 1) || null;
}

// ================= CUSTOM ADMIN QUESTION STORAGE & SYNC =================
export const CUSTOM_PROBLEMS_STORAGE_KEY = 'ASTROBIT_CUSTOM_PROBLEMS_V1';

export function getCustomProblems() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_PROBLEMS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export function saveCustomProblem(newProblem) {
  const current = getCustomProblems();
  const filtered = current.filter(p => p.id !== newProblem.id);
  const updated = [...filtered, newProblem];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_PROBLEMS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  }
  const idx = PROBLEMS.findIndex(p => p.id === newProblem.id);
  if (idx >= 0) {
    PROBLEMS[idx] = newProblem;
  } else {
    PROBLEMS.push(newProblem);
  }
  return updated;
}

export function removeCustomProblem(problemId) {
  const current = getCustomProblems();
  const updated = current.filter(p => p.id !== problemId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_PROBLEMS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  }
  const idx = PROBLEMS.findIndex(p => p.id === problemId);
  if (idx >= 0) {
    PROBLEMS.splice(idx, 1);
  }
  return updated;
}

// Hydrate custom problems from localStorage into in-memory curriculum
try {
  if (typeof window !== 'undefined') {
    const custom = getCustomProblems();
    if (Array.isArray(custom)) {
      custom.forEach(p => {
        if (!PROBLEMS.some(existing => existing.id === p.id)) {
          PROBLEMS.push(p);
        }
      });
    }
  }
} catch (e) {}

/**
 * Synchronize and hydrate problems from MongoDB Atlas into the client in-memory curriculum
 */
export function syncCurriculumFromDB(dbProblems) {
  if (!Array.isArray(dbProblems) || dbProblems.length === 0) return;
  dbProblems.forEach(p => {
    const idx = PROBLEMS.findIndex(existing => existing.id === p.id);
    if (idx >= 0) {
      PROBLEMS[idx] = { ...PROBLEMS[idx], ...p };
    } else {
      PROBLEMS.push(p);
      if (p.isCustom) {
        saveCustomProblem(p);
      }
    }
  });
}

