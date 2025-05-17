const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { threadId, content, owner } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, new Date().toISOString(), false, threadId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT 
          comments.id, 
          comments.content, 
          comments.date, 
          users.username, 
          comments.is_deleted
        FROM comments
        JOIN users ON comments.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };
  
    const result = await this._pool.query(query);
  
    return result.rows;
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = TRUE WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);

    return true;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError(
        "Anda tidak memiliki hak untuk menghapus komentar ini"
      );
    }

    return true;
  }

  async isCommentExists(threadId, commentId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND thread_id = $2 AND is_deleted = false",
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan dalam thread ini");
    }

    return true;
  }

  async isCommentBelongsToThread(threadId, commentId) {
    const query = {
      text: "SELECT 1 FROM comments WHERE id = $1 AND thread_id= $2 AND is_deleted = false",
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan didalam thread ini");
    }
    return true;
  }
}

module.exports = CommentRepositoryPostgres;
