const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("endpoints concerning CRUD on threads", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("when POST /threads", () => {
    it("should respond with 201 and persisted thread", async () => {
      // arrange
      const requestPayload = {
        title: "lorem ipsum",
        body: "dolor sit amet",
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });

      // action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data).toStrictEqual({
        addedThread: {
          id: expect.any(String),
          title: "lorem ipsum",
          owner: expect.any(String),
        },
      });
    });

    it("should respond with 401 when no access token is provided", async () => {
      // arrange
      const requestPayload = {
        title: "lorem ipsum",
        body: "dolor sit amet",
      };

      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toStrictEqual("Unauthorized");
      expect(responseJson.message).toStrictEqual("Missing authentication");
    });

    it("should respond with 400 when payload does not meet structure specifications", async () => {
      // arrange
      const requestPayload = {
        title: "lorem ipsum",
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });

      // action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toStrictEqual("fail");
      expect(responseJson.message).toStrictEqual(
        "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should respond with 400 when payload does not meet data type specifications", async () => {
      // arrange
      const requestPayload = {
        title: {},
        body: 123,
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });

      // action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toStrictEqual("fail");
      expect(responseJson.message).toStrictEqual(
        "tidak dapat membuat thread baru karena tipe data tidak sesuai"
      );
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should respond with 200 with thread details and comments", async () => {
      const server = await createServer(container);
    
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "JohnDoe",
      });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "JaneDoe",
      });
      await ThreadableTestHelper.addThread({
        id: threadId,
        // Tidak perlu mengatur title, body, dan date karena helper sudah memiliki nilai default
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId,
        owner: "user-123",
        content: "This is a comment",
        date: "2025-01-01T10:00:00.000Z",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        threadId,
        owner: "user-123",
        content: "Another comment",
        date: "2025-01-01T11:00:00.000Z",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-456",
        owner: "user-123",
        content: "This is a reply",
        date: "2025-01-01T12:00:00.000Z",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        commentId: "comment-123",
        owner: "user-456",
        content: "Another reply",
        date: "2025-01-01T12:30:00.000Z",
      });
    
      // action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });
    
      const responseJson = JSON.parse(response.payload);
    
      // expected response
      const expectedResponse = {
        status: "success",
        data: {
          thread: {
            id: threadId,
            title: "tes title", // Sesuaikan dengan nilai default dari helper
            body: "tes body", // Sesuaikan dengan nilai default dari helper
            date: "2025", // Sesuaikan dengan nilai default dari helper
            username: "JohnDoe",
            comments: [
              {
                id: "comment-123",
                username: "JohnDoe",
                date: "2025-01-01T10:00:00.000Z",
                replies: [
                  {
                    id: "reply-456",
                    content: "Another reply",
                    date: "2025-01-01T12:30:00.000Z",
                    username: "JaneDoe",
                  },
                ],
                content: "This is a comment",
              },
              {
                id: "comment-456",
                username: "JohnDoe",
                date: "2025-01-01T11:00:00.000Z",
                replies: [
                  {
                    id: "reply-123",
                    content: "This is a reply",
                    date: "2025-01-01T12:00:00.000Z",
                    username: "JohnDoe",
                  },
                ],
                content: "Another comment",
              },
            ],
          },
        },
      };
    
      // assert
      expect(response.statusCode).toEqual(200);
      expect(responseJson).toStrictEqual(expectedResponse);
    });

    it("should respond with 200 and with thread details with empty comments", async () => {
      const server = await createServer(container);
    
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "John Doe",
      });
      await ThreadableTestHelper.addThread({
        id: threadId,
        // Tidak perlu mengatur title, body, dan date karena helper sudah memiliki nilai default
      });
    
      // action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });
    
      const responseJson = JSON.parse(response.payload);
    
      // expected response
      const expectedResponse = {
        status: "success",
        data: {
          thread: {
            id: threadId,
            title: "tes title", // Sesuaikan dengan nilai default dari helper
            body: "tes body", // Sesuaikan dengan nilai default dari helper
            date: "2025", // Sesuaikan dengan nilai default dari helper
            username: "John Doe",
            comments: [],
          },
        },
      };
    
      // assert
      expect(response.statusCode).toEqual(200);
      expect(responseJson).toStrictEqual(expectedResponse);
    });

    it("should respond with 404 if thread does not exist", async () => {
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: "GET",
        url: "/threads/xyz",
      });

      const responseJson = JSON.parse(response.payload);

      // expected response
      const expectedResponse = {
        status: "fail",
        message: "thread tidak ditemukan",
      };

      // assert
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toStrictEqual(expectedResponse);
    });
  });
});