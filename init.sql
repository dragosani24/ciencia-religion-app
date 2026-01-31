CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS paragraphs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT,
    content TEXT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    paragraph_id INT,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);