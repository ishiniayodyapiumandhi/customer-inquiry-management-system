CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  contact VARCHAR(120) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demo password for both accounts: password123
INSERT INTO staff (name, email, password_hash) VALUES
  ('Maya Chen', 'maya@example.com', '$2a$10$3ydAGrjGdPraQw12g9jNjOQ7xGfbPdktG/hgUL/87q9rBwRefdS02'),
  ('Jon Bell', 'jon@example.com', '$2a$10$3ydAGrjGdPraQw12g9jNjOQ7xGfbPdktG/hgUL/87q9rBwRefdS02')
ON CONFLICT (email) DO NOTHING;
