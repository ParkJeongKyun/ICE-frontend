import React from 'react';
import { SpinnerWrapper } from './Spinner.styles';

interface SpinnerProps {
    size?: number;
    color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 16,
    color = '#ffffff',
}) => {
    return (
        <SpinnerWrapper $size={size} $color={color}>
            {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} />
            ))}
        </SpinnerWrapper>
    );
};

export default React.memo(Spinner);
