import http from "../../shared/services/http-common.js";

export class ForumApiService{

    getAllProfiles(){
        return http.get("/profiles");
    }

    getAllQuestions(){
        return http.get("/forum/questions");
    }

    createQuestion(question){
        return http.post("/forum/questions",question);
    }

    updateQuestion(id,question){
        return http.put(`/forum/questions/${id}`,question);
    }

    deleteQuestion(id){
        console.log('Sending delete request for question with ID:', id);

        return http.delete(`/forum/questions/${id}`)
            .then((response) => {
                console.log('Delete request successful:', response);
                return response;
            })
            .catch((error) => {
                console.error('Error in delete request:', error);
                throw error;
            });
    }


    getAllAnswers(){
        return http.get("/forum/answers");
    }
    getAnswerById(id){
        return http.get(`/forum/answers/${id}`);
    }
    getAnswerByQuestionId(id){
        return http.get(`/forum/question/${id}/answers`);
    }
    createAnswer(answer){
        return http.post("/forum/answers",answer);
    }

    deleteAnswer(id) {
        return http.delete(`/forum/answers/${id}`);
    }

    getAllCategories(){
        return http().get('/forum/categories');
    }
}