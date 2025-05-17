const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const pool = require("../../database/postgres/pool");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist comment and return added comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123"; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const newComment = {
        threadId: "thread-123",
        content: "sebuah komentar",
        owner: "user-123",
      };

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comment).toStrictEqual({
        id: "comment-123",
        date: expect.any(String),
        content: "sebuah komentar",
        thread_id: "thread-123",
        owner: "user-123",
        is_deleted: false,
      });
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "sebuah komentar",
          owner: "user-123",
        })
      );
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return comments by thread id", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        content: "sebuah komentar",
        date: "2025-01-01T10:00:00",
        owner: "user-123",
        isDeleted: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        "thread-123"
      );

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual({
        id: "comment-123",
        content: "sebuah komentar",
        date: "2025-01-01T10:00:00",
        username: "dicoding",
        is_deleted: false,
      });
    });
  });

  describe("deleteComment function", () => {
    it("should soft delete comment by id", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
      const result = await commentRepositoryPostgres.deleteComment("comment-123");

      expect(result).toBe(true); 

      // Assert database state
      const comment = await CommentsTableTestHelper.findCommentById("comment-123");
      expect(comment.is_deleted).toStrictEqual(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return true when comment exists and user is owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123'
      });
  
      const repo = new CommentRepositoryPostgres(pool, {});
  
      // Act & Assert
      await expect(repo.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.toBe(true); // Memverifikasi return value
    });
  
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123'
      });
  
      const repo = new CommentRepositoryPostgres(pool, {});
  
      // Act & Assert
      await expect(repo.verifyCommentOwner('comment-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });
  
    it('should throw AuthorizationError when comment does not exist', async () => {
      // Arrange
      const repo = new CommentRepositoryPostgres(pool, {});
  
      // Act & Assert
      await expect(repo.verifyCommentOwner('comment-999', 'user-123'))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe("isCommentExists function", () => {
    it("should not throw error if comment exists", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.isCommentExists("thread-123", "comment-123")
      ).resolves.toBe(true);
    });

    it("should throw NotFoundError if comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.isCommentExists("thread-123", "comment-456")
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("isCommentBelongsToThread function", () => {
    it("should not throw error if comment belongs to thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.isCommentBelongsToThread("thread-123", "comment-123")
      ).resolves.toBe(true);
    });

    it("should throw NotFoundError if comment does not belong to thread", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.isCommentBelongsToThread(
          "thread-123",
          "comment-456"
        )
      ).rejects.toThrowError(NotFoundError);
    });
  });
});