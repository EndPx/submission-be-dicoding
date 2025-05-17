const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
    constructor({ commentRepository, threadRepository}) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }
    
    async execute(useCasePayload, owner) {
        await this._threadRepository.isThreadExists(useCasePayload.threadId);
        const newComment = new NewComment({ ...useCasePayload, owner });
        return this._commentRepository.addComment(newComment);
    }
}

module.exports = AddCommentUseCase;