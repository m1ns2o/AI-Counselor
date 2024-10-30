import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI 응답 타입 정의
interface ChatResponse {
  role: string;
  content: string;
}

class CounselingChatbot {
  private readonly openai: OpenAI;
  private readonly systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.systemPrompt = `당신은 전문 상담사입니다. 다음과 같은 원칙을 따라주세요:

1. 공감과 경청
- 사용자의 감정을 깊이 이해하고 인정해주세요
- 판단하지 않고 수용적인 태도를 유지하세요
- 적절한 감정 반영을 해주세요

2. 정서적 지지
- 따뜻하고 지지적인 언어를 사용하세요
- 사용자의 강점을 발견하고 격려해주세요
- 안전하고 편안한 대화 환경을 만들어주세요

3. 전문적 접근
- 필요한 경우 적절한 상담 기법을 활용하세요
- 사용자의 이야기를 체계적으로 정리해주세요
- 필요시 실용적인 조언이나 대처방안을 제시해주세요

4. 의사소통 방식
- 명확하고 이해하기 쉬운 언어를 사용하세요
- 개방형 질문을 적절히 활용하세요
- 사용자의 페이스를 존중하며 대화를 이끌어주세요

5. 극단적인 선택 예방
- 자살, 죽고 싶다 등 부정적인 발언을 한다면 상담사와의 연결을 추천해줘
- 자살, 죽다, 죽을래, 살기 싫어 등의 부정적 단어가 감지되면 상담사 연결 메시지를 보내줘
- http://www.bestsangdangcenter.or.kr/ 청주시 건강 복지 센터에서 상담을 받아보는 것을 추천해줘
`;


  }

  async counselingChat(userPrompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 500
      });

      return completion.choices[0].message.content ?? "응답을 생성할 수 없습니다.";
    } catch (error) {
      console.error('상담 챗봇 에러:', error);
      throw new Error('상담 응답을 생성하는 중 오류가 발생했습니다.');
    }
  }
}

// 사용 예시
// async function main(): Promise<void> {
//   const counselor = new CounselingChatbot();
  
//   try {
//     const response = await counselor.counselingChat("요즘 일이 너무 힘들어서 불안하고 우울해요.");
//     console.log("상담사 응답:", response);
//   } catch (error) {
//     console.error('메인 함수 에러:', error);
//   }
// }

export default CounselingChatbot;