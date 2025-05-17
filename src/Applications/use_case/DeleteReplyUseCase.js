class DeleteReplyUseCase {
    constructor({ replyRepository, authenticationTokenManager , commentRepository}) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
    }

    async execute(useCaseParams, ownerId){
        const {threadId, commentId, replyId} = useCaseParams;
        await this._replyRepository.isReplyExists(commentId, replyId);
        await this._commentRepository.isCommentBelongsToThread(threadId, commentId);
        await this._replyRepository.verifyReplyOwner(replyId, ownerId);
        await this._replyRepository.deleteReplyById(replyId);
    }
}

module.exports = DeleteReplyUseCase;