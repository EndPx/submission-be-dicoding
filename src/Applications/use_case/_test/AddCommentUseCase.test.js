const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');


describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'Sebuah komentar',
    };

    const expectedComment = new AddedComment({
      id: 'comment-123',
      content: 'Sebuah komentar',
      owner: 'user-123',
    });


    const commentRepository =new CommentRepository();
    const threadRepository = new ThreadRepository();

    const addCommentUseCase = new AddCommentUseCase({commentRepository, threadRepository})

    threadRepository.isThreadExists = jest.fn(() => Promise.resolve(true));
    commentRepository.addComment = jest.fn(() =>
      new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      })
    );

    // Act
    const addedComment = await addCommentUseCase.execute(useCasePayload, 'user-123');

    // Assert
    expect(addedComment).toStrictEqual(expectedComment);
    expect(threadRepository.isThreadExists).toHaveBeenCalledWith('thread-123');
    expect(commentRepository.addComment).toHaveBeenCalledWith(new NewComment({
      threadId: 'thread-123',
      content: 'Sebuah komentar',
      owner: 'user-123',
    }));
    
  });
});
