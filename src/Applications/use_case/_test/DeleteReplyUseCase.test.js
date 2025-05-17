const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };
    const credentialId = 'user-123'; // Simulasi credentialId dari request.auth.credentials

    const replyRepository = new ReplyRepository();
    const commentRepository = new CommentRepository();

    // Mocking dependencies
    commentRepository.isCommentBelongsToThread = jest.fn(() => Promise.resolve(true)); // Tidak mengembalikan nilai
    replyRepository.isReplyExists = jest.fn(() => Promise.resolve(true)); // Tidak mengembalikan nilai
    replyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve(true)); // Tidak mengembalikan nilai
    replyRepository.deleteReplyById = jest.fn(() => Promise.resolve(true)); // Tidak mengembalikan nilai

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository,
      commentRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParams, credentialId);

    // Assert
    expect(commentRepository.isCommentBelongsToThread).toBeCalledWith('thread-123', 'comment-123'); // Pastikan parameter benar
    expect(replyRepository.isReplyExists).toBeCalledWith('comment-123', 'reply-123'); // Pastikan parameter benar
    expect(replyRepository.verifyReplyOwner).toBeCalledWith('reply-123', 'user-123'); // Pastikan parameter benar
    expect(replyRepository.deleteReplyById).toBeCalledWith('reply-123'); // Pastikan parameter benar
  });
});