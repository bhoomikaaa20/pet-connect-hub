-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.pet_status AS ENUM ('safe', 'lost', 'found');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ PETS ============
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  status public.pet_status NOT NULL DEFAULT 'safe',
  lost_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pets_status ON public.pets(status);
CREATE INDEX idx_pets_user_id ON public.pets(user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ============ TRIGGER: updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRIGGER: auto-create profile + default role on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TRIGGER: notify owner on status change ============
CREATE OR REPLACE FUNCTION public.notify_pet_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'lost' THEN
    INSERT INTO public.notifications (user_id, message, pet_id)
    VALUES (NEW.user_id, NEW.name || ' has been reported lost.', NEW.id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, message, pet_id)
    VALUES (NEW.user_id, NEW.name || ' status changed: ' || OLD.status || ' → ' || NEW.status || '.', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER pets_notify_status
  AFTER INSERT OR UPDATE OF status ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.notify_pet_status_change();

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- pets: owner sees own, public sees lost, admin sees all
CREATE POLICY "Owner views own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public views lost pets" ON public.pets FOR SELECT USING (status = 'lost');
CREATE POLICY "Admins view all pets" ON public.pets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner inserts pet" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner updates own pet" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins update any pet" ON public.pets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner deletes own pet" ON public.pets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins delete any pet" ON public.pets FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ============ STORAGE: pet-images bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);

CREATE POLICY "Pet images publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'pet-images');
CREATE POLICY "Users upload own pet images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own pet images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own pet images" ON storage.objects FOR DELETE
  USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);