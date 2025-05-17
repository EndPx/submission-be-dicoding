const NewThread = require('../NewThread');

describe('NewThread', () => {
  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Sebuah thread',
      body: 'Isi dari sebuah thread',
      owner: 'user-123',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Sebuah thread',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123, 
      body: true, 
      owner: {},
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});