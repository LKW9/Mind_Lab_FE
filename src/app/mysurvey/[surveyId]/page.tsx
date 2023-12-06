'use client'

import { createOptionGraphQLQuery } from '@/graphql/Option/createOption';
import { sendGraphQLQuery } from '@/graphql/Problem/createProblem';
import { mapQuestionsToProblems } from '@/graphql/Problem/getProblems';
import { deleteGraphQLQuery } from '@/graphql/Survey/deleteSurvey';
import { getGraphQLQuery } from '@/graphql/Survey/getMySurvey';
import { getSurveyDataGraphQLQuery } from '@/graphql/Survey/getSurveyData';
import { updateGraphQLQuery } from '@/graphql/Survey/updateSurveyTitle';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

interface Survey {
  s_id: string;
  title: string;
  description: string;
  user: string;
}

interface Question {
  q_id: string;
  text: string;
  survey: Survey;
  options: Option[];
}

interface Option {
  o_id: string;
  text: string;
  score: number;
}

export default function Home({ params }: {
  params: { surveyId:string}
}) {
  const [originTitle, setOriginTitle] = useState<string>('')
  const [surveyTitle, setSurveyTitle] = useState<string>(originTitle);
  const [originDescription, setOriginDescription] = useState<string>('');
  const [surveyDescription, setSurveyDescription] = useState<string>(originDescription);
  const [Questions, setQuestions] = useState<Question[]>([]);

  const surveyId = params.surveyId;

  const getSurveyData = async (surveyId: string) => {
    const query = `
    mutation GetSurveyData($surveyId: String!) {
      getSurveyData(surveyId: $surveyId) {
        title
        description
        questions {
          q_id
          text
          options {
            o_id
            text
            score
          }
        }
      }
    }
    `
    try {
      const result = await getSurveyDataGraphQLQuery(query, surveyId);
      setOriginTitle(result.data.getSurveyData.title)
      setOriginDescription(result.data.getSurveyData.description)
      console.log(result.data.getSurveyData)
    } catch (error) {
      console.error('설문지 데이터 로딩 실패:', error);
    }
  }

  const PushSurveyTitle = async (surveyId: string, newTitle: string) => {
    const query = `
      mutation UpdateMySurveyTitle($surveyId: String!, $newTitle: String!) {
        updateMySurveyTitle(surveyId: $surveyId, newTitle: $newTitle) {
          title
        }
      }
    `;
    try {
      const result = await updateGraphQLQuery(query, { surveyId, newTitle });
      if (result.data.PushSurveyTitle) {
        alert('수정 완료되었습니다.')
      }
    } catch (error) {
      console.error('설문지 제목 수정 실패:', error);
    }
  };

  const PushSurveyDescription = async (surveyId: string, newDescription: string) => {
    const query = `
      mutation UpdateMySurveyDescription($surveyId: String!, $newDescription: String!) {
        updateMySurveyDescription(surveyId: $surveyId, newDescription: $newDescription) {
          description
        }
      }
    `;
    try {
      const result = await updateGraphQLQuery(query, {surveyId, newDescription});
      if (result.data.PushSurveyDescription) {
        alert('수정 완료되었습니다.')
      }
    } catch (error) {
      console.error('설문지 설명 수정 실패:', error);
    }
  };

  const createQuestion = async (surveyId: string) => {
    const mutation = `
      mutation CreateQuestion($surveyId: String!) {
        createQuestion(surveyId: $surveyId) {
          q_id
        }
      }
    `;
    const variables = {
      surveyId: surveyId,
    };
    getQuestions(surveyId);
    try {
      const result = await sendGraphQLQuery(mutation, variables);
      if (result.data.createQuestion) {
      }
    } catch (error) {
      console.error('Question creation failed:', error);
    }
  };

  const getQuestions = async (surveyId: string) => {
    const query = `
      query GetAllQuestions($surveyId: String!) {
        getAllQuestions(surveyId: $surveyId) {
          q_id
          text
        }
      }
    `;

    const variables = {
      surveyId: surveyId,
    };

    try {
      const result = await mapQuestionsToProblems(query, variables);
      setQuestions(result.data.getAllQuestions || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const removeQuestion = async (surveyId: string, questionId: string) => {
    const mutation = `
      mutation DeleteQuestion($surveyId: String!, $questionId: String!) {
        deleteQuestion(surveyId: $surveyId, questionId: $questionId) {
          q_id
        }
      }
    `;

    const variables = {
      surveyId: surveyId,
      questionId: questionId,
    };

    try {
      const result = await deleteGraphQLQuery(mutation, variables);
    } catch (error) {
      console.error('Failed to delete questions:', error);
    }
  };

  const addOption = async (surveyId: string, questionId: string) => {
    const mutation = `
      mutation CreateOption($surveyId: String!, $questionId: String!) {
        createOption(surveyId: $surveyId, questionId: $questionId) {
          o_id
        }
      }
    `;
    const variables = {
      surveyId: surveyId,
      questionId: questionId
    };
    try {
      const result = await createOptionGraphQLQuery(mutation, variables);
      if (result.data.createOption) {
        alert('옵션 생성 완료되었습니다.');
      }
    } catch (error) {
      console.error('Option creation failed:', error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
        const query = `
          mutation GetSurveyData($surveyId: String!) {
            getSurveyData(surveyId: $surveyId) {
              title
              description
              questions {
                q_id
                text
                options {
                  o_id
                  text
                  score
                }
              }
            }
          }
          `
    try {
      const result = await getSurveyDataGraphQLQuery(query, surveyId);
      const surveyData = result.data.getSurveyData;

      setOriginTitle(surveyData.title);
      setOriginDescription(surveyData.description);

      const mappedQuestions = surveyData.questions.map((question: { q_id: string; text: string; options: any; }) => {
        return {
          q_id: question.q_id,
          text: question.text,
          survey: surveyData,
          options: question.options || [],
        };
      });

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('설문지 데이터 로딩 실패:', error);
    }
  };

    fetchData(); 
  }, [surveyId, Questions]);

  return (
    <main className='flex-col w-full h-full p-[30px] pt-[60px]'>
      <section className='w-full h-[100px]  flex items-center justify-end pr-[50px]'>
        { true ? <button className='w-[150px] h-[50px] p-[5px] rounded-md shadow-md ml-[20px] bg-slate-200 hover:bg-blue-400'><span className='font-bold text-[20px]'>Puplic</span></button> : null } 
        { false ? <button className='w-[150px] h-[50px] p-[5px] rounded-md shadow-md ml-[20px] bg-slate-200 hover:bg-blue-400'><span className='font-bold text-[20px]'>Private</span></button> : null }
      </section>
      <section className='titleSection w-full h-[200px]  flex items-center justify-center '>
        <div className='titleDiv w-[500px]  flex items-center justify-center'>
          <input
            type="text"
            placeholder={`${originTitle}`}
            className='text-center text-[30px] w-full font-bold'
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
          />
          <button
            className='absolute translate-x-[300px] w-[80px] p-[5px] rounded-md shadow-md bg-slate-200 hover:bg-blue-400'
            onClick={() => PushSurveyTitle(surveyId, surveyTitle)}
          >
            제목 저장
          </button>
        </div>
      </section>
      <section className='descriptoionSection w-full h-full  flex items-center justify-center mb-[120px]'>
        <div className='descriptoionDiv min-w-[800px] h-[130px] flex shadow-sm shadow-slate-400 rounded-md p-[30px] cursor-pointer'>
          <input
            type='text'
            placeholder={`${originDescription}`}
            className='w-full h-full bg-transparent border-none'
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
          />
          <button
            className='w-[120px] h-full p-[5px] rounded-md shadow-md bg-slate-200 hover:bg-blue-400'
            onClick={() => PushSurveyDescription(surveyId, surveyDescription)}
          >
            설명 저장
          </button>
        </div>
      </section>
      <section className='problemSection w-full min-h-[400px]  '>
        {Questions.length > 0 && (
          <ul className='problemUl flex-col list-decimal  pl-[30px]'>
            {Questions.map((Question, QuestionIndex) => (
              <li key={Question.q_id} className='mb-[30px] ml-[30px]'>
                <button
                  onClick={() => removeQuestion(surveyId, Question.q_id)}
                  className='bg-red-600 flex items-center justify-center absolute w-[30px] h-[30px] rounded-full translate-x-[-60px] translate-y-[-4px] hover:bg-slate-400 transition-all'
                >
                  <span className='text-white text-[40px]'>-</span>
                </button>
                <input
                  type="text"
                  placeholder={`${Question.text}`}
                  className='ml-[10px] pl-[10px] w-[500px]'
                />
                <button>문제 제목 저장</button>
                <div className='flex mt-[20px]'>
                  {Question.options && Question.options.map((option, optionIndex) => (
                    <div
                      key={option.o_id}
                      className='mr-[30px] px-[20px] py-[10px] shadow-sm shadow-slate-400 rounded-sm transition-all flex items-center'
                    >
                      <div className='bg-slate-300 flex items-center justify-center w-[35px] h-[35px] rounded-full mr-[10px]'>
                        <span>{optionIndex}</span>
                      </div>
                      <div className='flex flex-col items-center justify-between'>
                        <input type='text' placeholder={`${option.text}`} className='bg-transparent' />
                        <input type='number' placeholder={`${option.score}`} className='bg-transparent' />
                      </div>
                      <button
                        className='w-[40px] text-[20px] h-full rounded-sm shadow-sm hover:bg-blue-600 hover:text-white'
                      >
                        <FontAwesomeIcon icon={faCheck} className='text-[20px]' />
                      </button>
                      <button
                        className='w-[40px] text-[20px] h-full rounded-sm shadow-sm hover:bg-red-600 hover:text-white'
                      >
                        <FontAwesomeIcon icon={faTrash} className='text-[20px]' />
                      </button>
                    </div>
                  ))}
                  <button
                    className='mr-[30px] p-[10px] w-[100px] h-full shadow-sm shadow-slate-400 rounded-sm hover:bg-slate-400 transition-all'
                    onClick={() => addOption(surveyId, Question.q_id)}
                  >
                    <span className=''>문항 추가 +</span>
                  </button>
                </div>
              
              </li>
            ))}
          </ul>)}
        <div className='problemPlusDiv mt-[30px]'>
          <button
            className='w-full py-[10px] rounded-md shadow-sm shadow-slate-400 hover:bg-slate-400 transition-all'
            onClick={()=>createQuestion(surveyId)}
          >
            문항 추가하기 +
          </button>
        </div>
      </section>
    </main>
  );
}
