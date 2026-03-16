import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import styles from './Tooltip.module.scss';

const SHOW_DELAY = 400;
const VIEWPORT_PADDING = 8;

const Tooltip = React.memo(({ content, placement, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [shift, setShift] = useState(0);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const getAnchorPosition = useCallback(() => {
    if (!triggerRef.current) return { top: 0, left: 0 };

    const rect = triggerRef.current.getBoundingClientRect();

    switch (placement) {
      case 'top':
        return {
          top: rect.top + window.scrollY - 8,
          left: rect.left + window.scrollX + rect.width / 2,
        };
      case 'left':
        return {
          top: rect.top + window.scrollY + rect.height / 2,
          left: rect.left + window.scrollX - 8,
        };
      case 'right':
        return {
          top: rect.top + window.scrollY + rect.height / 2,
          left: rect.right + window.scrollX + 8,
        };
      case 'bottom':
      default:
        return {
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2,
        };
    }
  }, [placement]);

  // After tooltip renders (hidden), measure and clamp
  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const isHorizontal = placement === 'top' || placement === 'bottom';
    let offset = 0;

    if (isHorizontal) {
      const overflowRight = tooltipRect.right - (window.innerWidth - VIEWPORT_PADDING);
      const overflowLeft = VIEWPORT_PADDING - tooltipRect.left;

      if (overflowRight > 0) {
        offset = -overflowRight;
      } else if (overflowLeft > 0) {
        offset = overflowLeft;
      }
    }

    setShift(offset);
    setIsPositioned(true);
  }, [isVisible, placement]);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setShift(0);
      setIsPositioned(false);
      setIsVisible(true);
    }, SHOW_DELAY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
    setIsPositioned(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!isVisible)
    return (
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
    );

  const anchor = getAnchorPosition();
  const isHorizontal = placement === 'top' || placement === 'bottom';
  const arrowStyle = isHorizontal ? { left: `calc(50% - ${shift}px)` } : {};

  const tooltipStyle = {
    top: anchor.top,
    left: anchor.left + shift,
    visibility: isPositioned ? 'visible' : 'hidden',
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
      {ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          data-placement={placement}
          style={tooltipStyle}
        >
          <div className={styles.arrow} style={arrowStyle} />
          {content}
        </div>,
        document.body,
      )}
    </>
  );
});

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  children: PropTypes.node.isRequired,
};

Tooltip.defaultProps = {
  placement: 'bottom',
};

export default Tooltip;
