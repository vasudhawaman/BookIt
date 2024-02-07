CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT,
    password TEXT
);
INSERT INTO users(email,password,username) VALUES('abc@gmail.com','12345','abc');
CREATE TABLE books(
    book_id  SERIAL INTEGER,
    title TEXT,
    author TEXT,
    desc TEXT,
    price INTEGER,
    image TEXT,
    genre TEXT
);
CREATE TABLE review (
   user_id INTEGER,
    book_id INTEGER,
	reviewBYID INTEGER,
    review TEXT   
);
CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    book_id INTEGER,
    user_id INTEGER
);
CREATE TABLE cart(
    id SERIAL PRIMARY KEY,
    book_id INTEGER,
    user_id INTEGER
);