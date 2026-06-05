CREATE TABLE IF NOT EXISTS global_policies (
  notification_type TEXT NOT NULL,
  channel           TEXT NOT NULL,
  region            TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_type, channel, region)
);

INSERT INTO global_policies (notification_type, channel, region) VALUES
  ('marketing', 'sms', 'EU')
ON CONFLICT DO NOTHING;
