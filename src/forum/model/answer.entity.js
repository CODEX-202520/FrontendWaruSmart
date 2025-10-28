export class Answer {
    constructor(id, questionId, userName, answerText) {
        this.id = id;
        this.questionId = questionId;
        this.userName = userName;
        this.answerText = answerText;
    }

    static fromDisplayableAnswer(displayableAnswer) {
        return new Answer(
            displayableAnswer.id,
            displayableAnswer.questionId,
            displayableAnswer.authorId,
            displayableAnswer.content
        );
    }

    static toDisplayableAnswer(answer) {
        console.log("Converting answer:", answer);
        return {
            id: answer.answerId,
            questionId: answer.questionId,
            authorId: answer.authorId,  // Mantener el authorId
            userName: answer.userName,
            content: answer.answerText
        };
    }
}