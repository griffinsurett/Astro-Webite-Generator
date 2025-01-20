// src/components/Slider/Slider.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactCard from './ReactCard';

/**
 * A lightweight React-based carousel/slider component with optional infinite autoplay and drag support.
 * Implements cloned slides for seamless infinite looping via arrows.
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
 * - infinite: boolean (enable infinite autoplay looping)
 * - drag: boolean (enable drag/swipe functionality)
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
  infinite = false, // Controls autoplay looping
  drag = false,
  ItemComponent = ReactCard,
}) {
  // Initialize currentIndex to account for cloned slides at the start
  const [currentIndex, setCurrentIndex] = useState(slidesShown);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true); // Controls autoplay progression
  const trackRef = useRef(null);
  const intervalRef = useRef(null);
  const sliderRef = useRef(null);

  const totalItems = items.length;

  // Create cloned slides for infinite toggling via arrows
  const clonedStart = slidesShown > 0 ? items.slice(-slidesShown) : [];
  const clonedEnd = slidesShown > 0 ? items.slice(0, slidesShown) : [];
  const extendedItems = [...clonedStart, ...items, ...clonedEnd];
  const extendedTotal = extendedItems.length;

  // Calculate maxIndex based on original items
  const maxIndex = slidesShown + totalItems;

  /**
   * Helper function to reset transition and transform seamlessly.
   */
  const resetTransition = (newIndex) => {
    setCurrentIndex(newIndex);
    trackRef.current.style.transition = 'none';
    trackRef.current.style.transform = `translateX(-${newIndex * (100 / slidesShown)}%)`;
    // Force reflow to apply the transform without transition
    void trackRef.current.offsetWidth;
    // Re-enable transition
    setTimeout(() => {
      trackRef.current.style.transition = 'transform 0.3s ease-in-out';
    }, 0);
  };

  /**
   * moveSlides:
   * Moves the slider in the specified direction.
   * Allows infinite wrapping via arrows, regardless of the `infinite` prop.
   * For autoplay, prevents moving beyond the last slide if `infinite=false`.
   */
  const moveSlides = useCallback((direction) => {
    if (isTransitioning || totalItems === 0) return; // Prevent action during transition or if no items

    let newIndex = currentIndex;

    if (direction === 'left') {
      // Moving to next slides
      if (!infinite && newIndex + slidesScrolled > slidesShown + totalItems - 1) {
        // If finite autoplay and attempting to move beyond the last slide, clamp to last slide
        newIndex = slidesShown + totalItems - 1;
        setCanAutoplay(false);
        clearInterval(intervalRef.current);
      } else {
        newIndex += slidesScrolled;
      }
    } else if (direction === 'right') {
      // Moving to previous slides
      if (!infinite && newIndex - slidesScrolled < slidesShown) {
        // If finite autoplay and attempting to move before the first slide, clamp to first slide
        newIndex = slidesShown;
      } else {
        newIndex -= slidesScrolled;
      }
    }

    setCurrentIndex(newIndex);
    setIsTransitioning(true);
  }, [currentIndex, isTransitioning, slidesScrolled, infinite, slidesShown, totalItems]);

  /**
   * Autoplay effect:
   * Automatically moves slides based on autoplay settings.
   * Respects the `infinite` prop to determine looping behavior.
   */
  useEffect(() => {
    if (!autoplay || totalItems <= slidesShown) return;

    if (!infinite && !canAutoplay) return; // Do not autoplay if finite and already stopped

    const direction = slideDirection === 'right' ? 'right' : 'left';

    intervalRef.current = setInterval(() => {
      moveSlides(direction);
    }, autoplaySpeed);

    return () => clearInterval(intervalRef.current);
  }, [autoplay, autoplaySpeed, slidesShown, slideDirection, moveSlides, totalItems, infinite, canAutoplay]);

  /**
   * handleTransitionEnd:
   * Resets the transitioning state and handles index resetting for seamless looping via arrows.
   * Also handles stopping autoplay if `infinite=false` and the end is reached.
   */
  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    if (infinite) {
      if (currentIndex >= maxIndex) {
        // Reached end clone, reset to original start
        resetTransition(slidesShown);
      } else if (currentIndex < slidesShown) {
        // Reached start clone, reset to original end
        resetTransition(totalItems + slidesShown - slidesScrolled);
      }
    } else {
      if (currentIndex >= slidesShown + totalItems - 1) {
        // Reached the last original slide
        // Stop autoplay and clamp to last slide
        setCanAutoplay(false);
        clearInterval(intervalRef.current);
        resetTransition(slidesShown + totalItems - 1);
      }
      // No action needed if not reached the end
    }
  };

  /**
   * Update transform based on currentIndex:
   * Translates the slider to show the current slides.
   */
  useEffect(() => {
    if (trackRef.current && isTransitioning) {
      const translateX = -(currentIndex * (100 / slidesShown));
      trackRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex, slidesShown, isTransitioning]);

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
      if (autoplay && totalItems > slidesShown && (infinite || canAutoplay)) {
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
  }, [autoplay, autoplaySpeed, moveSlides, slideDirection, slidesShown, totalItems, infinite, canAutoplay]);

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
    const totalIndicators = infinite ? totalItems : Math.ceil(totalItems / slidesScrolled);
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

  /**
   * Drag Handling Logic
   */
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const sliderWidth = useRef(0);

  /**
   * Helper function to get the current slider width
   */
  const getSliderWidth = () => {
    if (sliderRef.current) {
      return sliderRef.current.offsetWidth;
    }
    return 0;
  };

  /**
   * Start dragging
   */
  const handleDragStart = (clientX) => {
    if (isTransitioning) return; // Prevent dragging during transition
    isDragging.current = true;
    startX.current = clientX;
    sliderWidth.current = getSliderWidth();
    prevTranslate.current = -currentIndex * (100 / slidesShown);
    currentTranslate.current = prevTranslate.current;
    trackRef.current.style.transition = 'none';
  };

  /**
   * Handle dragging movement
   */
  const handleDragMove = (clientX) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    const deltaPercentage = (deltaX / sliderWidth.current) * 100;
    currentTranslate.current = prevTranslate.current + deltaPercentage;
    trackRef.current.style.transform = `translateX(${currentTranslate.current}%)`;
  };

  /**
   * End dragging
   */
  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const movedBy = currentTranslate.current - prevTranslate.current;

    // Calculate the threshold (25% of slider width)
    const threshold = 25; // 25%

    // Re-enable transition for smooth animation
    trackRef.current.style.transition = 'transform 0.3s ease-in-out';

    if (movedBy < -threshold) {
      moveSlides('left'); // Next slide
    } else if (movedBy > threshold) {
      moveSlides('right'); // Previous slide
    } else {
      // Revert to original position
      trackRef.current.style.transform = `translateX(-${currentIndex * (100 / slidesShown)}%)`;
    }
  };

  /**
   * Attach Drag Event Handlers
   */
  useEffect(() => {
    const slider = sliderRef.current;

    if (!drag) return; // Do not attach drag handlers if drag is false

    // Mouse Events
    const handleMouseDown = (e) => handleDragStart(e.clientX);
    const handleMouseMove = (e) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeaveDrag = () => {
      if (isDragging.current) handleDragEnd();
    };

    // Touch Events
    const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    // Prevent scrolling when dragging horizontally
    const handleTouchMovePrevent = (e) => {
      if (isDragging.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX.current;
        if (Math.abs(deltaX) > 10) {
          e.preventDefault();
        }
      }
    };

    // Attach Events
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mouseleave', handleMouseLeaveDrag);

    slider.addEventListener('touchstart', handleTouchStart);
    slider.addEventListener('touchmove', handleTouchMovePrevent, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove);
    slider.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mouseleave', handleMouseLeaveDrag);

      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMovePrevent);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
    };
  }, [drag, moveSlides, slidesShown, slidesScrolled, currentIndex]);

  return (
    <div className="relative w-full" ref={sliderRef}>
      {/* Slider Track */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesShown)}%)`,
          }}
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
              focus:ring-2 focus:ring-gray-400
            "
            onClick={() => moveSlides('right')} // Move to previous slides
            aria-label="Previous Slide"
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
              focus:ring-2 focus:ring-gray-400
            "
            onClick={() => moveSlides('left')} // Move to next slides
            aria-label="Next Slide"
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
  infinite: PropTypes.bool, // Controls autoplay looping
  drag: PropTypes.bool, // New prop for enabling drag
  ItemComponent: PropTypes.func,
};

export default Slider;
