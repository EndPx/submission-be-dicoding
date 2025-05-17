const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const pool = require("../../database/postgres/pool");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist thread and return added thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const fakeIdGenerator = () => "123"; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const newThread = {
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      };

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(thread).toStrictEqual({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: expect.any(String),
        owner: "user-123",
      });
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: "sebuah thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should return thread when thread is found", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2025-01-01T10:00:00",
        owner: "user-123",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");

      // Assert
      expect(thread).toStrictEqual({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2025-01-01T10:00:00",
        username: "dicoding",
      });
    });

    it("should throw NotFoundError when thread is not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById("thread-456")
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("isThreadExists function", () => {
    it("should return true when thread exists", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      const repo = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(repo.isThreadExists("thread-123"))
        .resolves.toBe(true);
    });

    it("should throw NotFoundError when thread does not exist", async () => {
      // Arrange
      const repo = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(repo.isThreadExists("thread-456"))
        .rejects.toThrowError(NotFoundError);
    });
  });
});