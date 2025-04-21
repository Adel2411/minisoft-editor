MainPrgm Factorial;
Var
  let n: Int;
  let result: Float = 4.2;
  let i: Int = (-10);
BeginPg
{
  n := 5;
  result := 1.0;
  
  for i from 1 to n step 1 {
    result := result * i;
  }
  
  output(result);  <!- Outputs: 120 -!>
}
EndPg;
