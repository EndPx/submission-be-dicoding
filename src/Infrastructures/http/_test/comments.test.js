const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('endpoints concerning CRUD on comments', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond with 201 and persisted comment', async () => {
      // arrange
      const requestPayload = {
        content: 'somekind of comment',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toStrictEqual('success');
      expect(responseJson.data).toStrictEqual({
        addedComment: {
          id: expect.any(String),
          content: 'somekind of comment',
          owner: userId,
        },
      });
    });

    it('should respond with 400 when comment payload has missing specifications', async () => {
      // arrange
      const requestPayload = {};

      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toStrictEqual('fail');
      expect(responseJson.message).toStrictEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should respond with 400 when comment payload has wrong data type specifications', async () => {
      // arrange
      const requestPayload = {
        content: 2021,
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toStrictEqual('fail');
      expect(responseJson.message).toStrictEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond with 200 and return success status', async () => {
      // arrange
      const server = await createServer(container);

      const { userId, accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toStrictEqual('success');
    });

    it('should respond with 403 when someone tries to delete comment that they don\'t own', async () => {
      // arrange
      const server = await createServer(container);

      const { accessToken: firstAccessToken, userId: firstUserId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server,
        username: 'JohnDoe',
      });
      const firstThreadId = 'thread-123';
      const firstCommentId = 'comment-123';
      await ThreadableTestHelper.addThread({ id: firstThreadId, owner: firstUserId });
      await CommentsTableTestHelper.addComment({ id: firstCommentId, owner: firstUserId });

      const { accessToken: secondAccessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server,
        username: 'JaneDoe',
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${firstThreadId}/comments/${firstCommentId}`,
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toStrictEqual('fail');
      expect(responseJson.message).toStrictEqual(
        'Anda tidak memiliki hak untuk menghapus komentar ini'
      );
    });
  });
});