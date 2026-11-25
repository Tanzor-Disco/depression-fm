CREATE TABLE songs(
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	spotify_id TEXT UNIQUE NOT NULL CHECK(btrim(spotify_id) <> ''),
	title TEXT NOT NULL CHECK(btrim(title) <> ''),
	artist TEXT NOT NULL CHECK(btrim(artist) <> ''),
	image_url TEXT NOT NULL CHECK(btrim(image_url) <> ''),
	spotify_url TEXT NOT NULL CHECK(btrim(spotify_url) <> ''),
	description TEXT NOT NULL CHECK(btrim(description) <> '')
);

