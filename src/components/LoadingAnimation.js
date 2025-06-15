import React from 'react';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.fullHeight ? '70vh' : '200px'};
  width: 100%;
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: var(--text-color);
  margin: 15px 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
`;

const PulsesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function LoadingAnimation({ text = 'Загрузка', fullHeight = false }) {
  return (
    <LoadingWrapper className="loading-container" fullHeight={fullHeight}>
      <div className="loading-spinner"></div>
      <LoadingText className="loading-text">{text}</LoadingText>
      <PulsesContainer className="loading-pulses">
        <div className="loading-pulse"></div>
        <div className="loading-pulse"></div>
        <div className="loading-pulse"></div>
      </PulsesContainer>
    </LoadingWrapper>
  );
}

export default LoadingAnimation; 