import CounselingChatbot from "./api";
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

const counselor = new CounselingChatbot();

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

// HTTP 서버 생성
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

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
            const message = JSON.parse(data.toString());
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

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});