const AddReplyUseCase = require('../AddReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCasePayload = {
      content: 'Sebuah balasan',
    };

    const expectedReply = new AddedReply({
      id: 'reply-123',
      content: 'Sebuah balasan',
      owner: 'user-123',
    });

    const replyRepository = new ReplyRepository();
    const commentRepository = new CommentRepository();

    commentRepository.isCommentBelongsToThread = jest.fn(() => Promise.resolve(true));
    replyRepository.addReply = jest.fn(() =>
      new AddedReply({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      })
    );

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository,
      commentRepository,
    });

    // Act
    const addedReply = await addReplyUseCase.execute(
      useCaseParams,
      useCasePayload,
      'user-123'
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedReply);
    expect(commentRepository.isCommentBelongsToThread).toHaveBeenCalledWith(
      'thread-123',
      'comment-123'
    );
    expect(replyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({
        commentId: 'comment-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      })
    );
  });
});
