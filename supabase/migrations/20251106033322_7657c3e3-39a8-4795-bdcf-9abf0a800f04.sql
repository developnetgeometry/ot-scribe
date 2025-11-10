-- Create trigger to execute notification function on OT request changes
CREATE TRIGGER trigger_notify_ot_status_change
AFTER INSERT OR UPDATE ON public.ot_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_ot_status_change();