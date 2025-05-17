const NewReply = require('../NewReply');

describe('NewReply', () => {
  it('should create NewReply object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
      content: 'Sebuah balasan',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.content).toEqual(payload.content);
  });

  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'Sebuah balasan',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      owner: {},
      content: true,
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});