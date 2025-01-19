// src/components/Slider/Slider.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactCard from './ReactCard';

/**
 * A lightweight React-based carousel/slider component with optional infinite looping.
 * Implements cloned slides for seamless infinite looping.
 * 
 * Props:
 * - items: array of data to display (each item will render inside `ItemComponent`).
 * - autoplay: boolean
 * - autoplaySpeed: number (ms)
 * - slidesShown: number (how many slides are visible at once)
 * - slidesScrolled: number (how many slides to move on arrow click or auto-scroll)
 * - sideArrows: boolean (render next/prev arrows)
 * - slideDirection: string ('left' or 'right') - direction to auto-slide
 * - slideDots: boolean (render indicators/dots)
 * - infinite: boolean (enable infinite looping)
 * - ItemComponent: a React component to render each item (similar to your ItemsTemplate usage)
 */
function Slider({
  items = [],
  autoplay = true,
  autoplaySpeed = 3000,
  slidesShown = 1,
  slidesScrolled = 1,
  sideArrows = true,
  slideDirection = 'left',
  slideDots = false,
  infinite = false, // New prop
  ItemComponent = ReactCard,
}) {
  const [currentIndex, setCurrentIndex] = useState(infinite ? slidesShown : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);
  const sliderRef = useRef(null);

  const totalItems = items.length;

  // Create cloned slides
  const clonedStart = infinite ? items.slice(-slidesShown) : [];
  const clonedEnd = infinite ? items.slice(0, slidesShown) : [];
  const extendedItems = [...clonedStart, ...items, ...clonedEnd];

  const extendedTotal = extendedItems.length;

  // Calculate maxIndex based on infinite prop
  const maxIndex = infinite ? totalItems + slidesShown : totalItems - slidesShown;

  /**
   * moveSlides:
   * Moves the slider in the specified direction.
   * Handles infinite looping by updating currentIndex accordingly.
   */
  const moveSlides = useCallback((direction) => {
    if (isTransitioning || totalItems === 0) return; // Prevent action during transition or if no items

    let newIndex = currentIndex;

    if (direction === 'left') {
      newIndex += slidesScrolled;
      if (newIndex > maxIndex) {
        if (infinite) {
          newIndex = newIndex + slidesScrolled;
        } else {
          newIndex = maxIndex;
        }
      }
    } else if (direction === 'right') {
      newIndex -= slidesScrolled;
      if (newIndex < slidesShown) {
        if (infinite) {
          newIndex = newIndex - slidesScrolled;
        } else {
          newIndex = slidesShown;
        }
      }
    }

    setCurrentIndex(newIndex);
    setIsTransitioning(true);
  }, [currentIndex, isTransitioning, slidesScrolled, infinite, totalItems, maxIndex, slidesShown]);

  /**
   * Autoplay effect:
   * Automatically moves slides based on autoplay settings.
   */
  useEffect(() => {
    if (!autoplay || totalItems <= slidesShown) return;

    const direction = slideDirection === 'right' ? 'right' : 'left';

    intervalRef.current = setInterval(() => {
      moveSlides(direction);
    }, autoplaySpeed);

    return () => clearInterval(intervalRef.current);
  }, [autoplay, autoplaySpeed, slidesShown, slideDirection, moveSlides, totalItems]);

  /**
   * Handle transition end:
   * Resets the transitioning state and handles the infinite loop by resetting the currentIndex without transition.
   */
  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    if (infinite) {
      if (currentIndex >= totalItems + slidesShown) {
        // If we've moved past the last original slide, reset to the first original slide
        setCurrentIndex(slidesShown);
        // Temporarily disable transition to make the jump seamless
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(-${slidesShown * (100 / slidesShown)}%)`;
        // Force reflow to apply the transform without transition
        void trackRef.current.offsetWidth;
        // Re-enable transition
        setTimeout(() => {
          trackRef.current.style.transition = 'transform 0.3s ease-in-out';
        }, 0);
      } else if (currentIndex < slidesShown) {
        // If we've moved before the first original slide, reset to the last original slide
        setCurrentIndex(totalItems + slidesShown - slidesScrolled);
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(-${(totalItems + slidesShown - slidesScrolled) * (100 / slidesShown)}%)`;
        void trackRef.current.offsetWidth;
        setTimeout(() => {
          trackRef.current.style.transition = 'transform 0.3s ease-in-out';
        }, 0);
      }
    }
  };

  /**
   * Update transform based on currentIndex:
   * Translates the slider to show the current slides.
   */
  useEffect(() => {
    if (trackRef.current) {
      const translateX = -(currentIndex * (100 / slidesShown));
      trackRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex, slidesShown]);

  /**
   * Cleanup on unmount:
   * Clears any active intervals.
   */
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  /**
   * Pause autoplay on mouse enter and resume on mouse leave:
   * Enhances user control and experience.
   */
  useEffect(() => {
    const slider = sliderRef.current;

    const handleMouseEnter = () => {
      if (autoplay) {
        clearInterval(intervalRef.current);
      }
    };

    const handleMouseLeave = () => {
      if (autoplay && totalItems > slidesShown) {
        const direction = slideDirection === 'right' ? 'right' : 'left';
        intervalRef.current = setInterval(() => {
          moveSlides(direction);
        }, autoplaySpeed);
      }
    };

    if (slider) {
      slider.addEventListener('mouseenter', handleMouseEnter);
      slider.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (slider) {
        slider.removeEventListener('mouseenter', handleMouseEnter);
        slider.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [autoplay, autoplaySpeed, moveSlides, slideDirection, slidesShown, totalItems]);

  /**
   * Keyboard navigation:
   * Allows users to navigate slides using arrow keys.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        moveSlides('right'); // Previous slide
      } else if (e.key === 'ArrowRight') {
        moveSlides('left'); // Next slide
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveSlides]);

  /**
   * Render Indicators (dots) for slide navigation:
   * Allows users to jump to specific slides.
   */
  const indicators = [];
  if (slideDots) {
    const totalIndicators = infinite ? totalItems : maxIndex + 1;

    for (let i = 0; i < totalIndicators; i++) {
      indicators.push(
        <button
          key={i}
          className={`w-3 h-3 rounded-full mx-1 ${
            currentIndex === i * slidesScrolled + slidesShown ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onClick={() => {
            setCurrentIndex(i * slidesScrolled + slidesShown);
            setIsTransitioning(true);
          }}
          aria-label={`Go to slide ${i + 1}`}
        ></button>
      );
    }
  }

  return (
    <div className="relative w-full" ref={sliderRef}>
      {/* Slider Track */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesShown)}%)`,
          }}
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedItems.map((item, index) => (
            <div
              key={`${item.slug}-${index}`} // Ensure unique keys with index
              className="flex-shrink-0 w-full"
              style={{ flex: `0 0 ${100 / slidesShown}%` }}
            >
              <ItemComponent {...item} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {slideDots && totalItems > slidesShown && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex">
          {indicators}
        </div>
      )}

      {/* Navigation Arrows */}
      {sideArrows && totalItems > slidesShown && (
        <>
          {/* Prev Arrow */}
          <button
            type="button"
            className="
              absolute top-1/2 left-2 
              transform -translate-y-1/2 
              bg-white border border-gray-300 
              rounded-full p-2 shadow 
              hover:bg-gray-100 focus:outline-none
            "
            onClick={() => moveSlides('right')} // Move to previous slides
            aria-label="Previous Slide"
            disabled={!infinite && currentIndex === slidesShown} // Disable if not infinite and at first slide
          >
            &larr;
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            className="
              absolute top-1/2 right-2 
              transform -translate-y-1/2 
              bg-white border border-gray-300 
              rounded-full p-2 shadow 
              hover:bg-gray-100 focus:outline-none
            "
            onClick={() => moveSlides('left')} // Move to next slides
            aria-label="Next Slide"
            disabled={!infinite && currentIndex >= maxIndex + slidesShown} // Disable if not infinite and at last slide
          >
            &rarr;
          </button>
        </>
      )}
    </div>
  );
}

Slider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  autoplay: PropTypes.bool,
  autoplaySpeed: PropTypes.number,
  slidesShown: PropTypes.number,
  slidesScrolled: PropTypes.number,
  sideArrows: PropTypes.bool,
  slideDirection: PropTypes.oneOf(['left', 'right']),
  slideDots: PropTypes.bool,
  infinite: PropTypes.bool, // New prop type
  ItemComponent: PropTypes.func,
};

export default Slider;
