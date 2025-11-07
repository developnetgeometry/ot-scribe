-- Create a function to evaluate formulas dynamically
CREATE OR REPLACE FUNCTION public.evaluate_ot_formula(
  formula_text text,
  p_orp numeric,
  p_hrp numeric,
  p_hours numeric,
  p_basic numeric
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result numeric;
  if_condition text;
  selected_branch text;
BEGIN
  -- Handle simple formulas without IF
  IF formula_text NOT ILIKE '%IF%' THEN
    -- Replace variables with actual values
    formula_text := replace(formula_text, 'Hours', p_hours::text);
    formula_text := replace(formula_text, 'ORP', p_orp::text);
    formula_text := replace(formula_text, 'HRP', p_hrp::text);
    formula_text := replace(formula_text, 'Basic', p_basic::text);
    formula_text := replace(formula_text, '×', '*');
    formula_text := replace(formula_text, '÷', '/');
    
    -- Evaluate as numeric expression
    EXECUTE 'SELECT ' || formula_text INTO result;
    RETURN result;
  END IF;
  
  -- Handle IF statements: IF(Hours <= 4, 0.5 * ORP, 1 * ORP)
  -- Simple IF parsing for common patterns
  IF formula_text ~* 'IF\s*\(\s*Hours\s*<=\s*(\d+)' THEN
    -- Extract the hour threshold
    if_condition := regexp_replace(formula_text, '.*IF\s*\(\s*Hours\s*<=\s*(\d+).*', '\1');
    
    IF p_hours <= if_condition::numeric THEN
      -- Extract true value (between first comma and second comma)
      selected_branch := trim(regexp_replace(formula_text, '.*IF\s*\([^,]+,\s*([^,]+),.*', '\1'));
    ELSE
      -- Extract false value (after second comma, before closing paren)
      selected_branch := trim(regexp_replace(formula_text, '.*,\s*([^)]+)\s*\).*', '\1'));
    END IF;
    
    -- Now evaluate the selected branch
    selected_branch := replace(selected_branch, 'Hours', p_hours::text);
    selected_branch := replace(selected_branch, 'ORP', p_orp::text);
    selected_branch := replace(selected_branch, 'HRP', p_hrp::text);
    selected_branch := replace(selected_branch, 'Basic', p_basic::text);
    selected_branch := replace(selected_branch, '×', '*');
    selected_branch := replace(selected_branch, '÷', '/');
    
    EXECUTE 'SELECT ' || selected_branch INTO result;
    RETURN result;
  ELSIF formula_text ~* 'IF\s*\(\s*Hours\s*>\s*(\d+)' THEN
    -- Extract the hour threshold for greater than
    if_condition := regexp_replace(formula_text, '.*IF\s*\(\s*Hours\s*>\s*(\d+).*', '\1');
    
    IF p_hours > if_condition::numeric THEN
      selected_branch := trim(regexp_replace(formula_text, '.*IF\s*\([^,]+,\s*([^,]+),.*', '\1'));
    ELSE
      selected_branch := trim(regexp_replace(formula_text, '.*,\s*([^)]+)\s*\).*', '\1'));
    END IF;
    
    selected_branch := replace(selected_branch, 'Hours', p_hours::text);
    selected_branch := replace(selected_branch, 'ORP', p_orp::text);
    selected_branch := replace(selected_branch, 'HRP', p_hrp::text);
    selected_branch := replace(selected_branch, 'Basic', p_basic::text);
    selected_branch := replace(selected_branch, '×', '*');
    selected_branch := replace(selected_branch, '÷', '/');
    
    EXECUTE 'SELECT ' || selected_branch INTO result;
    RETURN result;
  END IF;
  
  -- Fallback: return 0 if formula couldn't be parsed
  RAISE NOTICE 'Could not parse formula: %', formula_text;
  RETURN 0;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error evaluating formula: % - Error: %', formula_text, SQLERRM;
    RETURN 0;
END;
$$;

-- Update the calculate_and_set_ot_amount trigger to use dynamic formula evaluation
CREATE OR REPLACE FUNCTION public.calculate_and_set_ot_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  emp_salary numeric;
  emp_category text;
  formula record;
  calculated_amount numeric;
BEGIN
  -- Get employee's basic salary and employment type
  SELECT basic_salary, employment_type INTO emp_salary, emp_category
  FROM profiles
  WHERE id = NEW.employee_id;
  
  IF emp_salary IS NULL THEN
    RAISE EXCEPTION 'Employee salary not found for employee_id: %', NEW.employee_id;
  END IF;
  
  -- Calculate base rates
  NEW.orp := emp_salary / 26;
  NEW.hrp := NEW.orp / 8;
  
  -- Get active formula for this day type and employee category
  SELECT * INTO formula
  FROM get_active_formula(NEW.day_type, COALESCE(emp_category, 'All'), NEW.ot_date);
  
  -- Apply formula if found
  IF formula.formula_id IS NOT NULL THEN
    NEW.formula_id := formula.formula_id;
    
    -- Try to evaluate the formula dynamically
    BEGIN
      calculated_amount := evaluate_ot_formula(
        formula.base_formula,
        NEW.orp,
        NEW.hrp,
        NEW.total_hours,
        emp_salary
      );
      
      -- If evaluation succeeded and returned a valid amount, use it
      IF calculated_amount IS NOT NULL AND calculated_amount > 0 THEN
        NEW.ot_amount := calculated_amount;
        RETURN NEW;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Formula evaluation failed, falling back to multiplier: %', SQLERRM;
    END;
    
    -- Fallback: use multiplier if formula evaluation failed
    IF formula.base_formula ILIKE '%hrp%' OR formula.base_formula = 'HRP' THEN
      NEW.ot_amount := NEW.hrp * formula.multiplier * NEW.total_hours;
    ELSIF formula.base_formula ILIKE '%orp%' OR formula.base_formula = 'ORP' THEN
      NEW.ot_amount := NEW.orp * formula.multiplier * NEW.total_hours;
    ELSE
      -- Handle conditional logic for tiered calculations
      CASE NEW.day_type
        WHEN 'weekday' THEN
          NEW.ot_amount := NEW.hrp * formula.multiplier * NEW.total_hours;
        WHEN 'saturday' THEN
          NEW.ot_amount := NEW.hrp * formula.multiplier * NEW.total_hours;
        WHEN 'sunday' THEN
          IF NEW.total_hours <= 4 THEN
            NEW.ot_amount := 0.5 * NEW.orp;
          ELSIF NEW.total_hours <= 8 THEN
            NEW.ot_amount := 1 * NEW.orp;
          ELSE
            NEW.ot_amount := (1 * NEW.orp) + (2 * NEW.hrp * (NEW.total_hours - 8));
          END IF;
        WHEN 'public_holiday' THEN
          IF NEW.total_hours <= 8 THEN
            NEW.ot_amount := 2 * NEW.orp;
          ELSE
            NEW.ot_amount := (2 * NEW.orp) + (3 * NEW.hrp * (NEW.total_hours - 8));
          END IF;
      END CASE;
    END IF;
  ELSE
    -- Legacy fallback: use hardcoded multipliers from Malaysian labor law
    CASE NEW.day_type
      WHEN 'weekday' THEN
        NEW.ot_amount := 1.5 * NEW.hrp * NEW.total_hours;
      WHEN 'saturday' THEN
        NEW.ot_amount := 2 * NEW.hrp * NEW.total_hours;
      WHEN 'sunday' THEN
        IF NEW.total_hours <= 4 THEN
          NEW.ot_amount := 0.5 * NEW.orp;
        ELSIF NEW.total_hours <= 8 THEN
          NEW.ot_amount := 1 * NEW.orp;
        ELSE
          NEW.ot_amount := (1 * NEW.orp) + (2 * NEW.hrp * (NEW.total_hours - 8));
        END IF;
      WHEN 'public_holiday' THEN
        IF NEW.total_hours <= 8 THEN
          NEW.ot_amount := 2 * NEW.orp;
        ELSE
          NEW.ot_amount := (2 * NEW.orp) + (3 * NEW.hrp * (NEW.total_hours - 8));
        END IF;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;