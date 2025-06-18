import React, { useState, useRef, useEffect } from 'react';
import { connectTelegramNotifications } from '../firebase';
import styled from 'styled-components';

const StyledButton = styled.button`
  background: linear-gradient(135deg, #23232e 0%, #181824 100%);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(20, 20, 20, 0.15);
  margin-top: 16px;
  width: 100%;
  max-width: 350px;
  font-family: 'Montserrat', sans-serif;
  &:hover {
    background: linear-gradient(135deg, #2e2e3a 0%, #23232e 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(20, 20, 20, 0.25);
  }
  &:disabled {
    background: #444;
    color: #bbb;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #00e676;
  cursor: pointer;
  padding: 8px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.copied svg {
    fill: #00e676;
  }
`;

const Timer = styled.div`
  margin-top: 10px;
  font-size: 15px;
  color: #00e676;
  font-weight: 500;
`;

const CodeBox = styled.div`
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  background: #181824;
  color: #00e676;
  border-radius: 8px;
  padding: 12px 20px;
  display: inline-block;
  vertical-align: middle;
`;

const CodeDisplayContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const TelegramConnectContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: #23232e;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 32px;
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 14px 4vw 18px 4vw;
    border-radius: 10px;
  }
`;

const TelegramConnect = ({ userId, onSuccess }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeGenerated, setIsCodeGenerated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef();
    const CODE_LIFETIME = 5 * 60; // 5 минут в секундах

    useEffect(() => {
        if (isCodeGenerated && timer > 0) {
            timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [timer, isCodeGenerated]);

    useEffect(() => {
        if (timer === 0 && isCodeGenerated) {
            setIsCodeGenerated(false);
            setVerificationCode('');
            setIsVerifying(false);
            setError('Срок действия кода истёк. Сгенерируйте новый код.');
        }
    }, [timer, isCodeGenerated]);

    const handleConnectTelegram = async () => {
        try {
            setIsVerifying(false);
            setError('');
            // Получаем код с сервера
            const response = await fetch('http://localhost:3001/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
            
            const data = await response.json();
            
            if (data.code) {
                setVerificationCode(data.code);
                setIsCodeGenerated(true);
                setTimer(CODE_LIFETIME);
                setError('');
                // Открываем Telegram бота в новом окне
                window.open('https://t.me/ProTrackerPVZBot', '_blank');
                // Начинаем проверку статуса верификации
                setIsVerifying(true);
                checkVerificationStatus(data.code);
            } else {
                throw new Error('Не удалось получить код верификации');
            }
        } catch (error) {
            console.error('Ошибка при генерации кода:', error);
            setError('Произошла ошибка при генерации кода. Пожалуйста, попробуйте снова.');
        }
    };

    const checkVerificationStatus = async (code) => {
        try {
            const response = await fetch('http://localhost:3001/api/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });
            
            const data = await response.json();
            
            if (data.verified) {
                // Код подтвержден, обновляем данные пользователя
                await connectTelegramNotifications(userId, data.telegramUserId);
                setIsVerifying(false);
                setIsCodeGenerated(false);
                setVerificationCode('');
                setTimer(0);
                if (onSuccess) onSuccess();
            } else if (data.error) {
                setError(data.error);
                setIsVerifying(false);
            } else {
                // Продолжаем проверку
                setTimeout(() => checkVerificationStatus(code), 5000);
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса:', error);
            setError('Произошла ошибка при проверке статуса. Пожалуйста, попробуйте снова.');
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleCopy = () => {
        if (verificationCode) {
            navigator.clipboard.writeText(verificationCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    };

    return (
        <TelegramConnectContainer>
            <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#fff', fontWeight: 700 }}>Подключение Telegram</h2>
            {!isCodeGenerated ? (
                <StyledButton 
                    onClick={handleConnectTelegram}
                    disabled={isVerifying}
                >
                    {isVerifying ? 'Подключение...' : 'Подключить уведомления'}
                </StyledButton>
            ) : (
                <div className="verification-code" style={{ textAlign: 'center' }}>
                    <p style={{ color: '#bbb', marginBottom: 8 }}>Ваш код подтверждения:</p>
                    <CodeDisplayContainer>
                        <CodeBox>
                            {verificationCode}
                        </CodeBox>
                        <CopyButton onClick={handleCopy} title={copied ? "Код скопирован!" : "Скопировать код"} className={copied ? 'copied' : ''}>
                            {copied ? (
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            )}
                        </CopyButton>
                    </CodeDisplayContainer>
                    <p style={{ color: '#bbb', marginBottom: 0 }}>Отправьте этот код боту <b style={{ color: '#00e676' }}>@ProTrackerPVZBot</b></p>
                    <Timer>
                        {timer > 0 ? `Код истечёт через: ${formatTime(timer)}` : 'Код истёк'}
                    </Timer>
                    {isVerifying && (
                        <div className="verifying-status" style={{ color: '#888', marginTop: 8 }}>
                            Ожидание подтверждения...
                        </div>
                    )}
                    <StyledButton 
                        onClick={handleConnectTelegram}
                        style={{ marginTop: 16 }}
                        disabled={isVerifying}
                    >
                        Сгенерировать новый код
                    </StyledButton>
                </div>
            )}
            {error && (
                <div className="error-message" style={{ color: '#e53935', marginTop: 12 }}>
                    {error}
                </div>
            )}
        </TelegramConnectContainer>
    );
};

export default TelegramConnect; 