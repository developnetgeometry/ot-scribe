-- Fix missing HR role assignment for hr@test.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('83fc01a8-5501-43a9-8c9f-8d2d57387661', 'hr')
ON CONFLICT (user_id, role) DO NOTHING;