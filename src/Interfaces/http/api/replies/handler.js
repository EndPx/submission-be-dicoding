const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addReplyUseCase = this._container.getInstance(
      AddReplyUseCase.name
    );

    const addedReply = await addReplyUseCase.execute(request.params, request.payload, userId);
    const response = h.response({
        status: "success",
        data: {
            addedReply
        }
    });

    response.code(201);
    return response
  }

  async deleteReplyByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );
    await deleteReplyUseCase.execute(request.params, userId);
  
    return h.response({
      status: "success",
    });
  }
}

module.exports = RepliesHandler;
