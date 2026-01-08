import * as RadixPopover from '@radix-ui/react-popover';
import PropTypes from 'prop-types';
import styles from './Popover.module.scss';

export default function Popover({
  trigger,
  content,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  container,
}) {
  const handlePopoverClick = (e) => {
    e.stopPropagation();
  };

  const handleOpenAutoFocus = (e) => {
    e.preventDefault();
  };

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal container={container}>
        <RadixPopover.Content
          sideOffset={10}
          alignOffset={10}
          side={side}
          align={align}
          className={styles.popoverWrapper}
          onClick={handlePopoverClick}
          onOpenAutoFocus={handleOpenAutoFocus}
          avoidCollisions
          collisionPadding={20}
        >
          <div className={styles.popoverContent}>{content}</div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

Popover.propTypes = {
  trigger: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  side: PropTypes.string,
  align: PropTypes.string,
  container: PropTypes.element,
};

Popover.defaultProps = {
  side: 'bottom',
  align: 'start',
  container: undefined,
};
