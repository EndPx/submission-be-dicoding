const AddThreadUseCase = require("../AddThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread"); // Tambahkan import ini

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Sebuah thread",
      body: "Isi dari sebuah thread",
    };

    const expectedThread = new AddedThread({
      id: "thread-123",
      title: "Sebuah thread",
      owner: "user-123",
    });

    const threadRepository = {};
    threadRepository.addThread = jest.fn(
      () =>
        new AddedThread({
          id: "thread-123",
          title: "Sebuah thread",
          owner: "user-123",
        })
    );

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(
      useCasePayload,
      "user-123"
    );

    // Assert
    expect(addedThread).toStrictEqual(expectedThread);
    expect(threadRepository.addThread).toHaveBeenCalledWith(
      new NewThread({
        title: "Sebuah thread",
        body: "Isi dari sebuah thread",
        owner: "user-123",
      })
    );
  });
});
