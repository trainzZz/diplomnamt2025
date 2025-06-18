import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { registerUser, loginUser, resetPassword } from '../firebase';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a2e 100%);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(142, 36, 170, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
    top: -100px;
    right: -100px;
    z-index: 0;
    animation: ${floatAnimation} 10s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(0, 230, 118, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
    bottom: -50px;
    left: -50px;
    z-index: 0;
    animation: ${floatAnimation} 8s ease-in-out infinite reverse;
  }
`;

const AuthCard = styled.div`
  background: rgba(45, 45, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-3);
  width: 100%;
  max-width: 420px;
  padding: 40px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
  border: 1px solid rgba(142, 36, 170, 0.2);
  min-height: 700px;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    animation: ${shimmer} 3s infinite;
    pointer-events: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  position: relative;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  padding-block-start: 15px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: var(--primary-light);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 16px;
  transition: all 0.3s ease;
  color: var(--text-color);
  box-sizing: border-box;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.25);
    background-color: rgba(30, 30, 30, 0.7);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  padding-right: ${props => (props.type === 'password' || props.type === 'text') && props.id !== 'email' ? '40px' : '14px'};
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.4);
  height: 54px;
  min-width: 200px;
  
  &:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(142, 36, 170, 0.6);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
    z-index: 1;
  }
  
  &:hover::after {
    animation: ripple 1s ease-out;
  }
`;

const SwitchModeButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--primary-light);
  font-size: 16px;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.3s ease;
  text-align: center;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: var(--primary-color);
    text-shadow: 0 0 5px rgba(142, 36, 170, 0.5);
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 1px;
    background: linear-gradient(to right, var(--primary-dark), var(--primary-color), var(--primary-dark));
    transition: width 0.3s ease;
  }
  
  &:hover::before {
    width: 80%;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 0 15px rgba(142, 36, 170, 0.5);
  animation: ${floatAnimation} 6s ease-in-out infinite;
  
  svg {
    margin-right: 12px;
    filter: drop-shadow(0 0 8px rgba(142, 36, 170, 0.5));
  }
`;

const FormToggle = styled.div`
  display: flex;
  margin-bottom: 30px;
  background-color: rgba(20, 20, 20, 0.5);
  border-radius: 30px;
  padding: 4px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    width: 50%;
    height: calc(100% - 8px);
    top: 4px;
    left: ${props => props.isLogin ? '4px' : '49%'};
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
    border-radius: 25px;
    transition: left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 0;
  }
`;

const ToggleButton = styled.button`
  width: 50%;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-weight: 600;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
  }
`;

const ForgotPasswordLink = styled.button`
  background: transparent;
  border: none;
  color: var(--primary-light);
  cursor: pointer;
  font-size: 14px;
  text-align: right;
  margin-top: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background: rgba(35, 35, 35, 0.95);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-3);
  max-width: 400px;
  width: 90%;
  padding: 30px;
  position: relative;
  animation: fadeIn 0.6s ease-out;
  border: 1px solid rgba(142, 36, 170, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    color: var(--text-color);
    font-family: 'Montserrat', sans-serif;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-light);
    transform: rotate(90deg);
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 20px;
  background-color: rgba(0, 200, 83, 0.1);
  border-left: 3px solid #00c853;
  color: #00c853;
  border-radius: 4px;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 20px;
  background-color: rgba(255, 50, 50, 0.1);
  border-left: 3px solid #ff5555;
  color: #ff5555;
  border-radius: 4px;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    color: var(--primary-light);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PasswordErrorMessage = styled(ErrorMessage)`
  background-color: rgba(255, 50, 50, 0.2);
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #ff3333;
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
    40%, 60% { transform: translate3d(3px, 0, 0); }
  }
`;

const FormContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AuthFormContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // States for password reset
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);

  // Функция проверки пароля
  const validatePassword = (password) => {
    // Не менее 8 символов, минимум одна цифра, минимум один спецсимвол, только латиница
    const length = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
    const noCyrillic = !/[а-яёА-ЯЁ]/.test(password);
    return length && hasNumber && hasSpecial && noCyrillic;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    setError('');
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setPasswordError('');
    
    try {
      if (isLogin) {
        // Процесс входа
        await loginUser(formData.email, formData.password);
        console.log('Успешный вход');
        if (onLogin) {
          onLogin();
        }
      } else {
        // Процесс регистрации
        if (!validatePassword(formData.password)) {
          setPasswordError('Пароль должен быть не менее 8 символов, содержать цифру, спецсимвол и не содержать русские буквы');
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Пароли не совпадают');
          setIsLoading(false);
          return;
        }
        await registerUser(formData.email, formData.password);
        console.log('Успешная регистрация');
        if (onLogin) {
          onLogin();
        }
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      // Обработка ошибок Firebase и преобразование их в понятные пользователю сообщения
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Неверный формат электронной почты';
          setError(errorMessage);
          break;
        case 'auth/user-disabled':
          errorMessage = 'Учетная запись отключена';
          setError(errorMessage);
          break;
        case 'auth/user-not-found':
          errorMessage = isLogin 
            ? 'Пользователь не найден. Возможно, вам нужно зарегистрироваться.' 
            : 'Пользователь не найден';
          setError(errorMessage);
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Такой учетной записи не существует';
          setError(errorMessage);
          break;
        case 'auth/wrong-password':
          errorMessage = 'Неверный пароль. Пожалуйста, проверьте правильность ввода или воспользуйтесь функцией восстановления пароля.';
          setPasswordError(errorMessage);
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Этот email уже используется. Возможно, вы уже зарегистрированы?';
          setError(errorMessage);
          break;
        case 'auth/weak-password':
          errorMessage = 'Пароль слишком простой. Используйте минимум 6 символов';
          setError(errorMessage);
          break;
        default:
          errorMessage = error.message || 'Произошла ошибка при аутентификации';
          setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode) => {
    if ((mode === 'login' && !isLogin) || (mode === 'register' && isLogin)) {
      setIsLogin(mode === 'login');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    
    if (!resetEmail.trim()) {
      setResetError('Пожалуйста, введите email');
      setResetLoading(false);
      return;
    }
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess('Инструкции по восстановлению пароля отправлены на ваш email');
      setResetEmail('');
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Ошибка при восстановлении пароля:', error);
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Неверный формат электронной почты';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Пользователь с таким email не найден';
          break;
        default:
          errorMessage = error.message || 'Произошла ошибка при восстановлении пароля';
      }
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      setIsPasswordValid(validatePassword(formData.password));
      setIsConfirmValid(formData.password === formData.confirmPassword && formData.confirmPassword.length > 0);
    }
  }, [formData, isLogin]);

  useEffect(() => {
    return () => clearTimeout();
  }, []);

  return (
    <AuthContainer>
      <AuthCard>
        <LogoContainer>
          <Logo>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M4 6L12 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M8 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            ProTracker
          </Logo>
        </LogoContainer>
        
        <FormToggle isLogin={isLogin}>
          <ToggleButton 
            active={isLogin} 
            onClick={() => toggleMode('login')}
          >
            Вход
          </ToggleButton>
          <ToggleButton 
            active={!isLogin} 
            onClick={() => toggleMode('register')}
          >
            Регистрация
          </ToggleButton>
        </FormToggle>
        
        <AuthFormContainer>
          {error && (
            <ErrorMessage>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </ErrorMessage>
          )}
          
          <Form onSubmit={handleSubmit}>
            <FormContent>
              <FormGroup>
                <Label htmlFor="email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 9L11.1056 12.5528C11.6686 12.8343 12.3314 12.8343 12.8944 12.5528L20 9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Email
                </Label>
                <Input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Введите ваш email"
                  required 
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                  Пароль
                </Label>
                <PasswordInputContainer>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введите пароль"
                    required 
                    style={(!isLogin && formData.password && !isPasswordValid) ? { borderColor: '#ff5555' } : {}}
                  />
                  <PasswordToggleButton 
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 22 12 22 12C21.5567 12.8742 20.9863 13.7026 20.3 14.47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.12 16.83C14.1356 17.411 13.0193 17.7347 11.85 17.77C5.00001 17.77 2.00001 12 2.00001 12C2.60178 10.9291 3.35975 9.93768 4.25001 9.05001L15.12 16.83Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </PasswordToggleButton>
                </PasswordInputContainer>
                {/* Forgot password link for login mode */}
                {isLogin && (
                  <ForgotPasswordLink type="button" onClick={() => setShowResetModal(true)}>
                    Забыли пароль?
                  </ForgotPasswordLink>
                )}
                {!isLogin && formData.password && !isPasswordValid && (
                  <PasswordErrorMessage>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                    Пароль должен быть не менее 8 символов, содержать цифру, спецсимвол и не содержать русские буквы
                  </PasswordErrorMessage>
                )}
              </FormGroup>
              
              {!isLogin && (
                <FormGroup>
                  <Label htmlFor="confirmPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Подтвердите пароль
                  </Label>
                  <PasswordInputContainer>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Подтвердите пароль"
                      required 
                      style={formData.confirmPassword && !isConfirmValid ? { borderColor: '#ff5555' } : {}}
                    />
                    <PasswordToggleButton 
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 22 12 22 12C21.5567 12.8742 20.9863 13.7026 20.3 14.47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15.12 16.83C14.1356 17.411 13.0193 17.7347 11.85 17.77C5.00001 17.77 2.00001 12 2.00001 12C2.60178 10.9291 3.35975 9.93768 4.25001 9.05001L15.12 16.83Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </PasswordToggleButton>
                  </PasswordInputContainer>
                  {formData.confirmPassword && !isConfirmValid && (
                    <PasswordErrorMessage>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                      </svg>
                      Пароли не совпадают
                    </PasswordErrorMessage>
                  )}
                </FormGroup>
              )}
              
              {!isLogin && <div style={{ flex: 1, minHeight: '1px' }}></div>}
            </FormContent>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
              <SubmitButton
                type="submit"
                disabled={isLoading || (!isLogin && (!isPasswordValid || !isConfirmValid))}
                style={!isLogin && (!isPasswordValid || !isConfirmValid) ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(0.5)' } : {}}
              >
                {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </SubmitButton>
            </div>
          </Form>
          
          <SwitchModeButton onClick={() => setIsLogin(!isLogin)}>
            {isLogin 
              ? 'Нет аккаунта? Создайте новый' 
              : 'Уже есть аккаунт? Войдите'}
          </SwitchModeButton>
        </AuthFormContainer>
      </AuthCard>
      
      {/* Модальное окно восстановления пароля */}
      <Modal show={showResetModal}>
        <ModalContent>
          <ModalHeader>
            <h2>Восстановление пароля</h2>
            <CloseButton onClick={() => setShowResetModal(false)}>×</CloseButton>
          </ModalHeader>
          
          {resetError && (
            <ErrorMessage>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {resetError}
            </ErrorMessage>
          )}
          
          {resetSuccess && (
            <SuccessMessage>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {resetSuccess}
            </SuccessMessage>
          )}
          
          <Form onSubmit={handlePasswordReset}>
            <FormGroup>
              <Label htmlFor="resetEmail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 9L11.1056 12.5528C11.6686 12.8343 12.3314 12.8343 12.8944 12.5528L20 9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Укажите ваш email
              </Label>
              <Input 
                type="email" 
                id="resetEmail" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Введите email для восстановления"
                required 
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={resetLoading}>
              {resetLoading ? 'Отправка...' : 'Восстановить пароль'}
            </SubmitButton>
            
            <SwitchModeButton onClick={() => setShowResetModal(false)}>
              Назад
            </SwitchModeButton>
          </Form>
        </ModalContent>
      </Modal>
    </AuthContainer>
  );
}

export default AuthPage; 