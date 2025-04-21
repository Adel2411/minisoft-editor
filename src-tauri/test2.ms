MainPrgm L3_software;
Var
  <!- Variable declarations -!>
  let counter: Int;
  let  sum, average: Float;
  let temperatures: [Float; 10];
  @define Const Max_temp: Float = (+100.0);
  @define Const Min_temp: Float = (-0.0);
  @define Const Default_temp: Float = 25.5;
  let test_value1: Int = 32767;
  let test_array1: [Float; 3] = {(-4.34), (+23.23), 19.0};
  let result: Float = 0.0;
  let result2: Float = 0.0;

  let i: Int;

  let x, z: Float;
  let y: Float;

BeginPg
{
  z := x + y; <!- TODO: Ask if --> Int + Float should result in Float, can't assign to Int -!>

  {--
    This is a sample program that calculates the average
    of a series of temperature readings
  --}
  
  <!- TODO: Think about this case, ask prof and handle it if necessary -!>
  result := result2;

  sum := (-32767.0);

  <!- TODO: Ask if it is allowed to negate an expression -!>
  <!- sum := -i; -!>
  
  <!- Input phase -!>
  for i from 0 to 9 step 1 {
    output("Enter temperature reading #", i+1, ": ");
    input(temperatures[i]);
    
    <!- Validate temperature range -!>
    if (temperatures[i] > Max_temp) then {
      output("Warning: Temperature exceeds maximum value!");
      temperatures[i] := Max_temp;
    } else {
      if (temperatures[i] < (-10.5)) then {
        output("Warning: Temperature well below minimum value!");
        temperatures[i] := Min_temp;
      }
      <!- TODO: Confirm that putting non boolean variable alone is valid condition -!>
      if (i == 1) then {
      }
    }
    
    sum := sum + temperatures[i];
  }
  
  <!- Calculate average -!>
  average := sum / 10;
  
  <!- Output results -!>
  output("Temperature readings:");
  counter := (-1);  <!- Start with -1 and increment first -!>
  do {
    counter := counter + 1;
    output("Reading #", counter+1, ": ", temperatures[counter]);
  } while (counter < (+9));
  
  output("Average temperature: ", average);
  
  <!- Check if average is within safe range -!>
  if ((average >= 50.0) AND (average <= (+75.0))) then {
    output("Average temperature is within safe operating range.");
  } else {
    output("Warningط: Average temperature is outside safe operating range!");
  }

  <!- Test operations priority -!>
  result := (test_value1 + test_array1[0]) * test_array1[1] / test_array1[2];
}
EndPg;
