INSERT INTO default_preferences (notification_type, channel, enabled) VALUES
  ('transactional', 'email', true),
  ('transactional', 'sms', true),
  ('transactional', 'push', true),
  ('transactional', 'messenger', true),
  ('marketing', 'email', false),
  ('marketing', 'sms', false),
  ('marketing', 'push', true),
  ('marketing', 'messenger', false)
ON CONFLICT DO NOTHING;
