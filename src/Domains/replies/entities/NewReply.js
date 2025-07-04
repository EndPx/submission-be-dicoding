class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, owner, content } = payload;

    this.commentId = commentId;
    this.owner = owner;
    this.content = content;
  }

  _verifyPayload(payload) {
    const { commentId, owner, content } = payload;
    if (!commentId || !owner || !content) {
      throw new Error("NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (
      typeof commentId !== "string" ||
      typeof owner !== "string" ||
      typeof content !== "string"
    ) {
      throw new Error("NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = NewReply;
