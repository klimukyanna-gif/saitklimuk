IF DB_ID('parks') IS NULL CREATE DATABASE parks;
GO
USE parks;
GO
DROP TABLE IF EXISTS route_items; DROP TABLE IF EXISTS routes; DROP TABLE IF EXISTS places; DROP TABLE IF EXISTS messages;

CREATE TABLE places (
  id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(120) NOT NULL, category NVARCHAR(60) NOT NULL,
  image NVARCHAR(120) NOT NULL DEFAULT N'', hours DECIMAL(4,1) NOT NULL, price DECIMAL(8,2) NOT NULL DEFAULT 0, description NVARCHAR(255));
CREATE TABLE routes (
  id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(120) NOT NULL, description NVARCHAR(255), time_limit DECIMAL(4,1),
  total_hours DECIMAL(5,1) NOT NULL, total_price DECIMAL(9,2) NOT NULL, is_preset BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE route_items (
  route_id INT NOT NULL, place_id INT NOT NULL, pos INT NOT NULL, PRIMARY KEY (route_id, pos),
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE, FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE);
CREATE TABLE messages (
  id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(100) NOT NULL, email NVARCHAR(150) NOT NULL, message NVARCHAR(MAX) NOT NULL,
  created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP);
GO

INSERT INTO places (name, category, image, hours, price, description) VALUES
  (N'Беловежская пуща', N'Национальные парки', N'img/place1.jpg', 5, 25, N'Древнейший лес Европы и зубры в вольерах.'),
  (N'Нарочанский парк', N'Национальные парки', N'img/place2.jpg', 4, 15, N'Крупнейшее озеро страны и сосновые леса.'),
  (N'Припятский парк', N'Национальные парки', N'img/place3.jpg', 5, 20, N'Поймы Припяти, болота и редкие птицы.'),
  (N'Браславские озёра', N'Национальные парки', N'img/place4.jpg', 4, 12, N'Более 30 озёр, смотровые вышки и тропы.'),
  (N'Парк Горького', N'Городские парки', N'img/place5.jpg', 2, 0, N'Главный парк Минска: аттракционы и набережная.'),
  (N'Парк Победы', N'Городские парки', N'img/place6.jpg', 2, 0, N'Тихие аллеи и озеро в центре Минска.'),
  (N'Лошицкая усадьба', N'Городские парки', N'img/place7.jpg', 2, 0, N'Усадебный парк XVIII века.'),
  (N'Парк Жилибера', N'Городские парки', N'img/place8.jpg', 1.5, 0, N'Старейший парк Гродно над Неманом.'),
  (N'Мирский замок и парк', N'Дворцовые ансамбли', N'img/place9.jpg', 3, 18, N'Замок XVI века, список ЮНЕСКО.'),
  (N'Несвижский ансамбль', N'Дворцовые ансамбли', N'img/place10.jpg', 4, 22, N'Резиденция Радзивиллов с парком.'),
  (N'Гомельский дворец и парк', N'Дворцовые ансамбли', N'img/place11.jpg', 3, 14, N'Ансамбль Румянцевых-Паскевичей.'),
  (N'Центральный ботанический сад', N'Ботанические сады', N'img/place12.jpg', 3, 10, N'Тысячи видов растений и оранжереи.');

INSERT INTO routes (name, description, time_limit, total_hours, total_price, is_preset) VALUES
  (N'Выходные в Минске', N'Зелёные места столицы за один уикенд.', NULL, 9, 10, 1),
  (N'Королевские замки', N'Дворцы и парки с богатой историей.', NULL, 10, 54, 1),
  (N'Озёрный край', N'Нарочь и Браслав: вода, сосны и тишина.', NULL, 8, 27, 1),
  (N'Дикая природа', N'Зубры, болота и пуща для исследователей.', NULL, 14, 60, 1);

INSERT INTO route_items (route_id, place_id, pos) VALUES
  (1, 5, 1),
  (1, 6, 2),
  (1, 7, 3),
  (1, 12, 4),
  (2, 9, 1),
  (2, 10, 2),
  (2, 11, 3),
  (3, 2, 1),
  (3, 4, 2),
  (4, 1, 1),
  (4, 3, 2),
  (4, 2, 3);
