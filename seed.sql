-- Run this SQL in your Nhost Database -> SQL Editor
-- Note: This assumes you have already created the 'todos' table.
-- If you want to associate these with a user, you'll need a user_id from the 'users' table.

INSERT INTO todos (title, is_completed, created_at)
VALUES 
  ('Learn Nhost and GraphQL', false, now()),
  ('Build a premium UI with React', true, now()),
  ('Secure the app with Nhost Auth', false, now()),
  ('Master Apollo Client mutations', false, now()),
  ('Deploy the application to Nhost', false, now());

-- To see the results:
SELECT * FROM todos ORDER BY created_at DESC;
