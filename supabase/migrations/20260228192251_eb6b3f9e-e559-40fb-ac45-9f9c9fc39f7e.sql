
-- Add request validation for page_views - limit to reasonable data
-- These INSERT policies are intentionally open for anonymous tracking/contact
-- but we add column-level constraints for safety

-- Add length constraints via a validation trigger for page_views
CREATE OR REPLACE FUNCTION public.validate_page_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.page_path) > 500 THEN
    RAISE EXCEPTION 'page_path too long';
  END IF;
  IF NEW.page_title IS NOT NULL AND length(NEW.page_title) > 200 THEN
    RAISE EXCEPTION 'page_title too long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_page_view_trigger
  BEFORE INSERT ON public.page_views
  FOR EACH ROW EXECUTE FUNCTION public.validate_page_view();

-- Add length constraints for contact_messages
CREATE OR REPLACE FUNCTION public.validate_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'name too long';
  END IF;
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'email too long';
  END IF;
  IF NEW.subject IS NOT NULL AND length(NEW.subject) > 200 THEN
    RAISE EXCEPTION 'subject too long';
  END IF;
  IF length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'message too long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_contact_message_trigger
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_contact_message();
