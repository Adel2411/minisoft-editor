// Example files content
export const exampleFilesMap: { [key: string]: string } = {
  'factorial.ms': `MainPrgm Factorial;
Var
  let n: Int;
  let result: Int;
  let i: Int;
BeginPg
{
  n := 5;
  result := 1;
  
  for i from 1 to n step 1 {
    result := result * i;
  }
  
  output(result);  <!- Outputs: 120 -!>
}
EndPg;`,
  'fibonacci.ms': `MainPrgm Fibonacci;
Var
  let n: Int = 10;
  let a: Int = 0;
  let b: Int = 1;
  let temp: Int;
  let i: Int;
BeginPg
{
  output(a);  <!- Outputs: 0 -!>
  output(b);  <!- Outputs: 1 -!>
  
  for i from 2 to n step 1 {
    temp := a + b;
    a := b;
    b := temp;
    output(b);
  }
}
EndPg;`,
  'hello_world.ms': `MainPrgm HelloWorld;
BeginPg
{
  output("Hello, World!");
}
EndPg;`,
  'loops.ms': `MainPrgm Loops;
Var
  let i: Int;
  let sum: Int = 0;
BeginPg
{
  for i from 1 to 5 step 1 {
    sum := sum + i;
    output(sum);
  }
}
EndPg;`,
  'conditionals.ms': `MainPrgm Conditionals;
Var
  let x: Int = 10;
  let y: Int = 20;
BeginPg
{
  if (x > y) {
    output("x is greater than y");
  } else {
    output("y is greater than or equal to x");
  }
}
EndPg;`
};
