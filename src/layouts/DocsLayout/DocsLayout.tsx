'use client';

import React from 'react';
import { Container, Card } from './DocsLayout.styles';
import PreviewFaqUseCases from '@/components/Home/PreviewFaqUseCases';

const DocsLayout: React.FC = () => {
  return (
    <Container>
      <Card>
        <PreviewFaqUseCases />
      </Card>
    </Container>
  );
};

export default DocsLayout;
