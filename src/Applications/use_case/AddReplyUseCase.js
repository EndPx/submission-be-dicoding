const NewReply = require("../../Domains/replies/entities/NewReply");

class AddReplyUseCase {
    constructor({ replyRepository, commentRepository}){
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
    }

    async execute(useCaseParams, useCasePayload, owner){
        const {threadId, commentId} = useCaseParams;
        await this._commentRepository.isCommentBelongsToThread(threadId, commentId);
        const newReply = new NewReply({ commentId, owner, ...useCasePayload});
        return this._replyRepository.addReply(newReply);

    }
}

module.exports = AddReplyUseCase;