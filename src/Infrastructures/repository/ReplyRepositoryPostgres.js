const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const { content, commentId, owner } = reply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
  
    const query = {
      text: `INSERT INTO replies (id, content, date, comment_id, owner) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, content, owner`,
      values: [id, content, date, commentId, owner],
    };
  
    const result = await this._pool.query(query);
  
    return new AddedReply({ ...result.rows[0]});
  }

  async getRepliesByCommentId(commentIds) {
    const query = {
      text: `
        SELECT replies.id, replies.content, replies.date, replies.is_deleted, replies.comment_id, users.username
        FROM replies
        INNER JOIN users ON users.id = replies.owner
        WHERE replies.comment_id = ANY($1::text[])
        ORDER BY replies.date ASC
      `,
      values: [commentIds],
    };
  
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };
  
    const result = await this._pool.query(query);
  
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak memiliki hak');
    }
    return true;
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id = $1',
      values: [replyId],
    };
  
    await this._pool.query(query);

    return true;
  }

  async isReplyExists(commentId, replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2 AND is_deleted = false',
      values: [replyId, commentId],
    };
  
    const result = await this._pool.query(query);
  
    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan dalam komentar ini'); 
    }

    return true;
  }
}

module.exports = ReplyRepositoryPostgres;
