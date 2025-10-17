-- Добавляем новые категории ботов
INSERT INTO public.bot_categories (name, description) VALUES
  ('Боты мульти', 'Универсальные боты для различных целей'),
  ('Боты для GTA 5', 'Специализированные боты для GTA 5 стримов'),
  ('Боты для CS 2', 'Специализированные боты для Counter-Strike 2'),
  ('Боты для Dota', 'Специализированные боты для Dota 2')
ON CONFLICT DO NOTHING;