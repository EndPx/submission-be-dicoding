class DeleteCommentUseCase {
    constructor({commentRepository}){
        this._commentRepository = commentRepository;
    }

    async execute(useCaseParams, ownerId){
        const {threadId, commentId} = useCaseParams;
        await this._commentRepository.isCommentExists(threadId, commentId);
        await this._commentRepository.verifyCommentOwner(commentId, ownerId);
        await this._commentRepository.deleteComment(commentId);
    }
}

module.exports = DeleteCommentUseCase;