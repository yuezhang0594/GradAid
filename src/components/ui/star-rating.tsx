import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    /** The maximum rating value, default is 5 */
    maxRating?: number;
    /** The current rating value */
    value?: number;
    /** Handler that gets called when the rating changes */
    onChange?: (value: number) => void;
    /** Read-only mode disables rating interaction */
    readOnly?: boolean;
    /** Optional additional class names */
    className?: string;
    /** Size of the stars */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * A customizable star rating component that allows users to provide feedback on a numeric scale.
 * 
 * This component renders a row of star icons that can be clicked to select a rating.
 * It supports hover effects, read-only mode, and different sizing options.
 * 
 * @example
 * // Basic usage
 * <StarRating onChange={(value) => console.log(`Selected rating: ${value}`)} />
 * 
 * @example
 * // Read-only display with custom rating
 * <StarRating value={4.5} readOnly />
 * 
 * @example
 * // Custom maximum rating and size
 * <StarRating maxRating={10} size="lg" />
 * 
 * @param props - The star rating component props
 * @param [props.maxRating=5] - The maximum rating value
 * @param [props.value=0] - The current rating value 
 * @param [props.onChange] - Handler called when rating changes
 * @param [props.readOnly=false] - When true, disables interaction
 * @param [props.className] - Additional CSS classes
 * @param [props.size="md"] - Size of the stars: "sm" (small), "md" (medium), or "lg" (large)
 * 
 * @returns A star rating component
 */
const StarRating = ({
    maxRating = 5,
    value = 0,
    onChange,
    readOnly = false,
    className,
    size = 'md',
}: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    // Determine the visual fill state of each star
    const getRatingState = (index: number) => {
        const starPosition = index + 1;
        if (hoverValue !== null && !readOnly) {
            return starPosition <= hoverValue ? 'filled' : 'empty';
        }
        return starPosition <= value ? 'filled' : 'empty';
    };

    // Size classes for the stars
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-1',
                className
            )}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
        >
            {Array.from({ length: maxRating }).map((_, index) => {
                const starState = getRatingState(index);

                return (
                    <Star
                        key={index}
                        className={cn(
                            'transition-all cursor-pointer',
                            starState === 'filled' ? 'fill-yellow-400' : 'fill-transparent text-gray-300',
                            readOnly ? 'cursor-default' : 'hover:scale-110',
                            sizeClasses[size]
                        )}
                        onMouseEnter={() => !readOnly && setHoverValue(index + 1)}
                        onClick={() => !readOnly && onChange?.(index + 1)}
                    />
                );
            })}
        </div>
    );
};

export { StarRating };