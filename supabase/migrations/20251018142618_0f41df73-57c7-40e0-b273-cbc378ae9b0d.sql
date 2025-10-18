-- Перемещаем ботов из старых категорий в новые
UPDATE public.bots 
SET category_id = '9b9d574c-2fce-42e5-aad2-fecf20e61b80'
WHERE category_id = '234e0061-0a73-44e1-87d4-28688311b803';

-- Удаляем старые/дублирующиеся категории
DELETE FROM public.bot_categories 
WHERE id IN (
  '234e0061-0a73-44e1-87d4-28688311b803', -- Боты для ГТА
  'a366696b-2825-41b5-a169-6b423baae97d', -- Боты для CS:GO
  '4879a78d-7b44-47e8-936b-445a92e439df'  -- Боты для Dota (дубликат)
);

-- Обновляем название "Боты мульти"
UPDATE public.bot_categories 
SET name = 'Мульти боты', 
    description = 'Универсальные боты для различных целей'
WHERE id = '3fb268de-abe2-474b-ac46-da1d36d011e8';