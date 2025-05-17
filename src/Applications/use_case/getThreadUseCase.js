const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    await this._threadRepository.isThreadExists(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);

    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((comment) => comment.id);

    const replies = await this._replyRepository.getRepliesByCommentId(commentIds);

    const repliesByCommentId = replies.reduce((acc, reply) => {
      const formattedReply = new DetailReply({
        id: reply.id,
        content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      });

      if (!acc[reply.comment_id]) {
        acc[reply.comment_id] = [];
      }
      acc[reply.comment_id].push(formattedReply);
      return acc;
    }, {});

    const formattedComments = comments.map((comment) => new DetailComment({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      replies: repliesByCommentId[comment.id] || [],
    }));

    return new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: formattedComments,
    });
  }
}

module.exports = GetThreadUseCase;