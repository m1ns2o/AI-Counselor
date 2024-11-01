import CounselingChatbot from "./api";
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';

const counselor = new CounselingChatbot();
const app = express();

async function chatWithCounselor(text: string): Promise<string> {
    try {
        const response = await counselor.counselingChat(text);
        console.log('Counselor response:', response);
        return response;
    } catch (error) {
        console.error('Counseling error:', error);
        throw error;
    }
}

// Vue.js 빌드 파일 경로 설정
const DIST_DIR = path.join(__dirname, '../dist'); // Vue.js 빌드 파일 위치

// 정적 파일 제공 미들웨어 설정
app.use(express.static(DIST_DIR));

// API 라우트 설정
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Vue 라우터를 위한 모든 경로에서 index.html 제공
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Express 앱을 HTTP 서버로 감싸기
const server = http.createServer(app);

// WebSocket 서버 생성
const wss = new WebSocketServer({ server });

interface Message {
    type: string;
    content: string;
    timestamp: number;
}

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    // 연결된 클라이언트에게 웰컴 메시지 전송
    const welcomeMessage: Message = {
        type: 'welcome',
        content: '안녕하세요 AI상담사 입니다. 고민이 있다면 얘기해 보세요!',
        timestamp: Date.now()
    };
    ws.send(JSON.stringify(welcomeMessage));

    // 클라이언트로부터 메시지 수신
    ws.on('message', async (data: WebSocket.Data) => {
        try {
            const message = JSON.parse(data.toString()) as Message;
            console.log('Received message:', message);

            // 챗봇 응답 처리
            const counselorResponse = await chatWithCounselor(message.content);
            
            // 응답 메시지 생성 및 전송
            const responseMessage: Message = {
                type: 'response',
                content: counselorResponse,
                timestamp: Date.now()
            };
            
            ws.send(JSON.stringify(responseMessage));
            
        } catch (error) {
            console.error('Error processing message:', error);
            
            // 에러 메시지 전송
            const errorMessage: Message = {
                type: 'error',
                content: 'An error occurred while processing your message',
                timestamp: Date.now()
            };
            ws.send(JSON.stringify(errorMessage));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});