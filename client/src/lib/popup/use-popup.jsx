// import { ResizeObserver } from '@juggle/resize-observer';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Popover from '../../ui/Popover';

export default (Step, props) => {
  return useMemo(() => {
    const Popup = React.memo(({ children, onClose, ...stepProps }) => {
      const [isOpened, setIsOpened] = useState(false);

      // const wrapper = useRef(null);
      // const resizeObserver = useRef(null);

      const handleOpen = useCallback(() => {
        setIsOpened(true);
      }, []);

      const handleClose = useCallback(() => {
        setIsOpened(false);

        if (onClose) {
          onClose();
        }
      }, [onClose]);

      const handleOpenChange = useCallback(
        (open) => {
          if (open) {
            handleOpen();
          } else {
            handleClose();
          }
        },
        [handleOpen, handleClose],
      );

      const handleMouseDown = useCallback((event) => {
        event.stopPropagation();
      }, []);

      const handleClick = useCallback((event) => {
        event.stopPropagation();
      }, []);

      const handleTriggerClick = useCallback(
        (event) => {
          event.stopPropagation();

          const { onClick } = children;

          if (onClick) {
            onClick(event);
          }
        },
        [children],
      );

      // const handleContentRef = useCallback((element) => {
      //   if (resizeObserver.current) {
      //     resizeObserver.current.disconnect();
      //   }

      //   if (!element) {
      //     resizeObserver.current = null;
      //     return;
      //   }

      //   resizeObserver.current = new ResizeObserver(() => {
      //     if (resizeObserver.current.isInitial) {
      //       resizeObserver.current.isInitial = false;
      //       return;
      //     }

      //     wrapper.current.positionUpdate();
      //   });

      //   resizeObserver.current.isInitial = true;
      //   resizeObserver.current.observe(element);
      // }, []);

      const trigger = React.cloneElement(children, {
        onClick: handleTriggerClick,
      });

      return (
        <Popover
          trigger={trigger}
          content={<Step {...stepProps} onClose={handleClose} />} // eslint-disable-line react/jsx-props-no-spreading
          hideCloseButton={stepProps.hideCloseButton}
          open={isOpened}
          onOpenChange={handleOpenChange}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          {...props} // eslint-disable-line react/jsx-props-no-spreading
        />
      );
    });

    Popup.propTypes = {
      children: PropTypes.node.isRequired,
      onClose: PropTypes.func,
      hideCloseButton: PropTypes.bool,
    };

    Popup.defaultProps = {
      onClose: undefined,
      hideCloseButton: false,
    };

    return Popup;
  }, [props]);
};
