CREATE TABLE vocabulary (
  vocab_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  cantonese    TEXT    NOT NULL,
  jyutping     TEXT    NOT NULL,
  english      TEXT    NOT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  tag_name     TEXT    NOT NULL PRIMARY KEY,
  description  TEXT,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vocabulary_tags (
  vocab_id  INTEGER NOT NULL,
  tag_name  TEXT    NOT NULL,
  PRIMARY KEY (vocab_id, tag_name),
  FOREIGN KEY (vocab_id)  REFERENCES vocabulary(vocab_id),
  FOREIGN KEY (tag_name)  REFERENCES tags(tag_name)
);