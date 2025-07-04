class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, replies } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = content;
  }

  _verifyPayload(payload) {
    const { id, username, date, content, replies } = payload;
    if (!id || !username || !date || !content || !replies) {
      throw new Error("DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      typeof date !== "string" ||
      typeof content !== "string" ||
      !Array.isArray(replies)
    ) {
      throw new Error("DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = DetailComment;
