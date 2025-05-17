const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const pool = require("../../database/postgres/pool");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist reply and return added reply correctly", async () => {
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
      const fakeIdGenerator = () => "123"; // stub
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const newReply = {
        content: "sebuah balasan",
        commentId: "comment-123",
        owner: "user-123",
      };

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(reply).toStrictEqual({
        id: "reply-123",
        content: "sebuah balasan",
        comment_id: "comment-123",
        date: expect.any(String),
        owner: "user-123",
        is_deleted: false,
      });
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: "sebuah balasan",
          owner: "user-123",
        })
      );
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies by comment id", async () => {
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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        content: "sebuah balasan",
        date: "2025-01-01T10:00:00",
        owner: "user-123",
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId([
        "comment-123",
      ]);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual({
        id: "reply-123",
        content: "sebuah balasan",
        date: "2025-01-01T10:00:00",
        is_deleted: false,
        comment_id: "comment-123",
        username: "dicoding",
      });
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should return true when reply exists and user is owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const repo = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        repo.verifyReplyOwner("reply-123", "user-123")
      ).resolves.toBe(true);
    });

    it("should throw AuthorizationError when user is not the owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const repo = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        repo.verifyReplyOwner("reply-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should throw AuthorizationError when reply does not exist", async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        repo.verifyReplyOwner("reply-999", "user-123")
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe("deleteReplyById function", () => {
    it("should soft delete reply by id", async () => {
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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById("reply-123");

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(reply.is_deleted).toStrictEqual(true);
    });
  });

  describe("isReplyExists function", () => {
    it("should not throw error if reply exists", async () => {
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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.isReplyExists("comment-123", "reply-123")
      ).resolves.toBe(true);
    });

    it("should throw NotFoundError if reply does not exist", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.isReplyExists("comment-123", "reply-456")
      ).rejects.toThrowError(NotFoundError);
    });
  });
});
