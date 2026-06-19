-- Mission Control: Earth vs. Aliens
-- Seed Data (example/demo data)

USE mission_control;

-- Example demo scores for the leaderboard
INSERT INTO scores (username, score, created_at) VALUES
('CommanderNova', 1450, NOW()),
('StarPilot42', 1200, NOW()),
('GalaxyDefender', 980, NOW()),
('AstroAce', 760, NOW()),
('SpaceCadet', 540, NOW());
