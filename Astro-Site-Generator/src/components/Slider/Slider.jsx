import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactCard from './ReactCard';

/**
 * A lightweight React-based carousel/slider component.
 * 
 * Props:
 * - items: array of data to display (each item will render inside `ItemComponent`).
 * - autoplay: boolean
 * - autoplaySpeed: number (ms)
 * - infinite: boolean (if true, wrap around when reaching ends)
 * - slidesShown: number (how many slides are visible at once)
 * - slidesScrolled: number (how many slides to move on arrow click or auto-scroll)
 * - sideArrows: boolean (render next/prev arrows)
 * - ItemComponent: a React component to render each item (similar to your ItemsTemplate usage)
 */
function Slider({
  items = [],
  autoplay = true,
  autoplaySpeed = 1000,
  infinite = true,
  slidesShown = 1,
  slidesScrolled = 1,
  sideArrows = true,
  /** 
   * If user doesn't pass a custom ItemComponent, 
   * we default to ReactCard 
   **/
  ItemComponent = ReactCard,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const totalItems = items.length;

  /**
   * Move to next slides.
   */
  const nextSlide = () => {
    const maxIndex = Math.max(totalItems - slidesShown, 0);
    setCurrentIndex((prev) => {
      let newIndex = prev + slidesScrolled;
      if (newIndex > maxIndex) {
        newIndex = infinite ? 0 : maxIndex;
      }
      return newIndex;
    });
  };

  /**
   * Move to previous slides.
   */
  const prevSlide = () => {
    const maxIndex = Math.max(totalItems - slidesShown, 0);
    setCurrentIndex((prev) => {
      let newIndex = prev - slidesScrolled;
      if (newIndex < 0) {
        newIndex = infinite ? maxIndex : 0;
      }
      return newIndex;
    });
  };

  /**
   * Autoplay effect
   */
  useEffect(() => {
    console.log('Autoplay setup:', { autoplay, totalItems, slidesShown });

    if (!autoplay || totalItems <= slidesShown) return;

    // Clear any existing interval
    clearInterval(intervalRef.current);

    // Start interval
    intervalRef.current = setInterval(() => {
      console.log('Autoplay triggered');
      nextSlide();
    }, autoplaySpeed);

    // Cleanup
    return () => clearInterval(intervalRef.current);
  }, [autoplay, autoplaySpeed, totalItems, slidesShown]); // Removed currentIndex

  /**
   * Inline styles for the container & track
   */
  const containerStyles = {
    overflow: 'hidden',
    width: '100%',
  };

  const slideWidthPercent = 100 / slidesShown;
  const translateX = -(currentIndex * slideWidthPercent);

  const trackStyles = {
    display: 'flex',
    transition: 'transform 0.3s ease',
    transform: `translateX(${translateX}%)`,
    width: `${(totalItems * 100) / slidesShown}%`,
  };

  const slideStyles = {
    flex: `0 0 ${slideWidthPercent}%`,
  };

  return (
    <div className="relative w-full">
      {/* The main slider container */}
      <div style={containerStyles}>
        <div style={trackStyles}>
          {items.map((item, idx) => (
            <div key={item.slug || idx} style={slideStyles}>
              <ItemComponent {...item} />
            </div>
          ))}
        </div>
      </div>

      {/* Side arrows (conditionally rendered) */}
      {sideArrows && totalItems > slidesShown && (
        <>
          {/* Prev arrow */}
          <button
            type="button"
            className="
              absolute top-1/2 left-2 
              transform -translate-y-1/2 
              bg-white border border-gray-300 
              rounded-full p-2 shadow 
              hover:bg-gray-100 focus:outline-none
            "
            onClick={prevSlide}
            aria-label="Previous Slide"
          >
            &larr;
          </button>
          {/* Next arrow */}
          <button
            type="button"
            className="
              absolute top-1/2 right-2 
              transform -translate-y-1/2 
              bg-white border border-gray-300 
              rounded-full p-2 shadow 
              hover:bg-gray-100 focus:outline-none
            "
            onClick={nextSlide}
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
  items: PropTypes.arrayOf(PropTypes.object),
  autoplay: PropTypes.bool,
  autoplaySpeed: PropTypes.number,
  infinite: PropTypes.bool,
  slidesShown: PropTypes.number,
  slidesScrolled: PropTypes.number,
  sideArrows: PropTypes.bool,
  ItemComponent: PropTypes.func,
};

export default Slider;
