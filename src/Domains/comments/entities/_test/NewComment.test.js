const NewComment = require('../NewComment');

describe('NewComment', () => {
  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Sebuah komentar',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      threadId: true,
      owner: {},
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});