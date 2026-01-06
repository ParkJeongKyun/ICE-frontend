import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    SelectContainer,
    SelectButton,
    SelectDropdown,
    SelectOption,
} from './index.styles';
import Tooltip from '@/components/common/Tooltip';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    tooltip?: string;
    tooltipType?: 'fixed' | 'follow';
    tooltipDelay?: number;
}

const Select: React.FC<SelectProps> = ({
    value,
    options,
    onChange,
    placeholder = 'Select...',
    tooltip,
    tooltipType = 'fixed',
    tooltipDelay = 500,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    const handleOptionClick = useCallback(
        (optionValue: string) => {
            onChange(optionValue);
            setIsOpen(false);
        },
        [onChange]
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const selectContent = (
        <SelectContainer ref={containerRef}>
            <SelectButton onClick={handleToggle} type="button">
                {selectedOption?.label || placeholder}
            </SelectButton>
            {isOpen && (
                <SelectDropdown>
                    {options.map((opt) => (
                        <SelectOption
                            key={opt.value}
                            $isSelected={opt.value === value}
                            onClick={() => handleOptionClick(opt.value)}
                        >
                            {opt.label}
                        </SelectOption>
                    ))}
                </SelectDropdown>
            )}
        </SelectContainer>
    );

    return tooltip ? (
        <Tooltip 
            text={tooltip} 
            type={tooltipType} 
            forceHide={isOpen}
            delay={tooltipDelay}
        >
            {selectContent}
        </Tooltip>
    ) : (
        selectContent
    );
};

export default React.memo(Select);
