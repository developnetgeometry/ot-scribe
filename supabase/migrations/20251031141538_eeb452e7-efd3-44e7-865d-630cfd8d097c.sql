-- Create enhanced OT calculation function that uses active formulas
CREATE OR REPLACE FUNCTION public.calculate_and_set_ot_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_salary numeric;
  emp_category text;
  formula record;
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
  
  -- Apply formula if found, otherwise use legacy calculation
  IF formula.formula_id IS NOT NULL THEN
    -- Store which formula was used
    NEW.formula_id := formula.formula_id;
    
    -- Apply the multiplier from the active formula
    IF formula.base_formula = 'hrp' THEN
      NEW.ot_amount := NEW.hrp * formula.multiplier * NEW.total_hours;
    ELSIF formula.base_formula = 'orp' THEN
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
$$;

-- Create trigger to automatically calculate OT amount on insert or update
DROP TRIGGER IF EXISTS calculate_ot_amount_trigger ON ot_requests;
CREATE TRIGGER calculate_ot_amount_trigger
BEFORE INSERT OR UPDATE ON ot_requests
FOR EACH ROW
EXECUTE FUNCTION calculate_and_set_ot_amount();

-- Backfill existing OT requests to trigger calculation
UPDATE ot_requests
SET updated_at = now()
WHERE ot_amount IS NULL OR orp IS NULL OR hrp IS NULL;