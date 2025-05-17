const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const credentialId = 'user-123'; // Simulasi credentialId dari request.auth.credentials

    const commentRepository = new CommentRepository();

    // Mocking dependencies
    commentRepository.isCommentExists = jest.fn(() => Promise.resolve(true));
    commentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve(true));
    commentRepository.deleteComment = jest.fn(() => Promise.resolve(true));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParams, credentialId);

    // Assert
    expect(commentRepository.isCommentExists).toBeCalledWith('thread-123', 'comment-123');
    expect(commentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    expect(commentRepository.deleteComment).toBeCalledWith('comment-123');
  });
});