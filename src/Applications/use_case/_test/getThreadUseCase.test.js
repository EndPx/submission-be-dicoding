const GetThreadUseCase = require("../getThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");
const DetailReply = require("../../../Domains/replies/entities/DetailReply");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");

describe("GetThreadUseCase", () => {
  it("should throw NotFoundError when thread does not exist", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.isThreadExists = jest.fn(() =>
      Promise.reject(new Error("Thread not found"))
    );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(getThreadUseCase.execute({ threadId })).rejects.toThrowError(
      "Thread not found"
    );
    expect(mockThreadRepository.isThreadExists).toBeCalledWith(threadId);
  });

  it("should orchestrate the get thread action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2025-01-01T09:00:00.000Z",
      username: "dicoding",
    };
    const mockComments = [
      {
        id: "comment-123",
        username: "JohnDoe",
        date: "2025-01-01T10:00:00.000Z",
        content: "This is a comment",
        is_deleted: false,
      },
      {
        id: "comment-456",
        username: "JaneDoe",
        date: "2025-01-01T11:00:00.000Z",
        content: "Another comment",
        is_deleted: true, // Komentar dihapus
      },
    ];
    const mockReplies = [
      {
        id: "reply-123",
        comment_id: "comment-123",
        username: "JohnDoe",
        date: "2025-01-01T12:00:00.000Z",
        content: "This is a reply",
        is_deleted: false,
      },
      {
        id: "reply-456",
        comment_id: "comment-123",
        username: "JaneDoe",
        date: "2025-01-01T12:30:00.000Z",
        content: "Another reply",
        is_deleted: true, // Balasan dihapus
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.isThreadExists = jest.fn(() => Promise.resolve(true));
    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve(mockThread)
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve(mockComments)
    );
    mockReplyRepository.getRepliesByCommentId = jest.fn(() =>
      Promise.resolve(mockReplies)
    );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadUseCase.execute({ threadId });

    // Assert
    expect(mockThreadRepository.isThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      threadId
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith([
      "comment-123",
      "comment-456",
    ]);
    const expectedResult = new DetailThread({
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2025-01-01T09:00:00.000Z",
      username: "dicoding",
      comments: [
        new DetailComment({
          id: "comment-123",
          username: "JohnDoe",
          date: "2025-01-01T10:00:00.000Z",
          content: "This is a comment",
          replies: [
            new DetailReply({
              id: "reply-123",
              content: "This is a reply",
              date: "2025-01-01T12:00:00.000Z",
              username: "JohnDoe",
            }),
            new DetailReply({
              id: "reply-456",
              content: "**balasan telah dihapus**",
              date: "2025-01-01T12:30:00.000Z",
              username: "JaneDoe",
            }),
          ],
        }),
        new DetailComment({
          id: "comment-456",
          username: "JaneDoe",
          date: "2025-01-01T11:00:00.000Z",
          content: "**komentar telah dihapus**",
          replies: [],
        }),
      ],
    });

    expect(result).toStrictEqual(expectedResult);
  });

  it("should return thread with no comments", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2025-01-01T09:00:00.000Z",
      username: "dicoding",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.isThreadExists = jest.fn(() => Promise.resolve(true));
    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve(mockThread)
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve([])
    );
    mockReplyRepository.getRepliesByCommentId = jest.fn(() =>
      Promise.resolve([])
    );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadUseCase.execute({ threadId });

    // Assert
    expect(mockThreadRepository.isThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      threadId
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith([]);
    expect(result.comments).toHaveLength(0);
  });
});
