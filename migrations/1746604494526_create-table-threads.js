/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      unique: true,
    },
    title: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    body: {
      type: "TEXT",
      notNull: true,
    },
    date: {
        type: "TEXT",
        notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNUll: true,
    },
  });
  pgm.addConstraint(
    "threads",
    "fk_threads.owner_users.id",
    "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint("threads", "fk_threads.owner_users.id");
  pgm.dropTable("threads");
};
