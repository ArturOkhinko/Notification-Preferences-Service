CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  timezone   TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS default_preferences (
  notification_type TEXT NOT NULL,
  channel           TEXT NOT NULL,
  enabled           BOOLEAN NOT NULL,
  PRIMARY KEY (notification_type, channel)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id           TEXT NOT NULL REFERENCES users(id),
  notification_type TEXT NOT NULL,
  channel           TEXT NOT NULL,
  enabled           BOOLEAN NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_type, channel)
);

CREATE TABLE IF NOT EXISTS quiet_hours (
  user_id    TEXT PRIMARY KEY REFERENCES users(id),
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  timezone   TEXT NOT NULL
);
