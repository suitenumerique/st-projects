import initials from 'initials';
import React from 'react';
import PropTypes from 'prop-types';
import { UserAvatar } from '@gouvfr-lasuite/ui-kit';

const SIZES = {
  XSMALL: 'xsmall',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const User = React.memo(({ name, avatarUrl, size, isDisabled, onClick }) => {
  const initialsWithSpace = initials(name).split('').join(' ');
  const contentNode = <UserAvatar fullName={initialsWithSpace} size={size} />;

  return onClick ? (
    <button type="button" disabled={isDisabled} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

User.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

User.defaultProps = {
  avatarUrl: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default User;
