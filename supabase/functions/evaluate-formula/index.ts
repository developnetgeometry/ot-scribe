import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormulaEvaluationRequest {
  formula: string;
  basicSalary: number;
  hours: number;
  dayType: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formula, basicSalary, hours, dayType }: FormulaEvaluationRequest = await req.json();

    console.log('Evaluating formula:', { formula, basicSalary, hours, dayType });

    // Calculate base rates
    const orp = basicSalary / 26;
    const hrp = orp / 8;

    // Evaluate formula safely
    const otAmount = evaluateFormulaSafe(formula, {
      Hours: hours,
      ORP: orp,
      HRP: hrp,
      Basic: basicSalary,
    });

    console.log('Evaluation result:', { orp, hrp, otAmount });

    return new Response(
      JSON.stringify({
        success: true,
        orp,
        hrp,
        otAmount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Formula evaluation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function evaluateFormulaSafe(formula: string, variables: Record<string, number>): number {
  // Convert IF statements to JavaScript ternary operators
  let jsFormula = convertIFToTernary(formula);

  // Replace variable names with their values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    jsFormula = jsFormula.replace(regex, value.toString());
  }

  console.log('Converted formula:', jsFormula);

  // Validate: only allow numbers, operators, and parentheses
  if (!/^[\d\s+\-*/()?:.]+$/.test(jsFormula)) {
    throw new Error('Formula contains invalid characters after substitution');
  }

  // Evaluate using Function (safer than eval in this controlled context)
  try {
    const result = new Function(`return ${jsFormula}`)();
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Formula did not evaluate to a valid number');
    }
    return result;
  } catch (e: any) {
    throw new Error(`Formula evaluation failed: ${e.message}`);
  }
}

function convertIFToTernary(formula: string): string {
  let result = formula;
  let maxIterations = 20;

  while (maxIterations-- > 0) {
    // Match IF(condition, trueVal, falseVal) patterns
    const ifMatch = result.match(/IF\s*\(([^()]+(?:\([^()]*\))*[^()]*)\)/i);
    if (!ifMatch) break;

    const args = splitIFArguments(ifMatch[1]);
    if (args.length === 3) {
      const ternary = `(${args[0]} ? ${args[1]} : ${args[2]})`;
      result = result.replace(ifMatch[0], ternary);
    } else {
      throw new Error('IF statement must have exactly 3 arguments');
    }
  }

  return result;
}

function splitIFArguments(argsStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of argsStr) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}
