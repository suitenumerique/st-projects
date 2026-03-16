import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UserAvatar } from '@gouvfr-lasuite/ui-kit';

import Tooltip from '../Tooltip/Tooltip';

const SIZES = {
  XSMALL: 'xsmall',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const AVATAR_COLORS = [
  'gray',
  'brand',
  'red',
  'orange',
  'brown',
  'green',
  'blue-1',
  'blue-2',
  'pink',
  'yellow',
  'purple',
];

const AVATAR_SHADES = ['primary', 'secondary']; // tertiary is too light

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + hash * 31;
  }

  const index = Math.abs(hash) % (AVATAR_COLORS.length * AVATAR_SHADES.length);
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const shade = AVATAR_SHADES[Math.floor(index / AVATAR_COLORS.length)];

  return `var(--c--contextuals--background--palette--${color}--${shade})`;
};

// eslint-disable-next-line no-unused-vars
const User = React.memo(({ name, avatarUrl, size, isDisabled, onClick, showTooltip }) => {
  const forceColor = useMemo(() => getAvatarColor(name), [name]);
  const avatarNode = <UserAvatar fullName={name} size={size} forceColor={forceColor} />;

  const contentNode = showTooltip ? (
    <Tooltip placement="top" content={name}>
      {avatarNode}
    </Tooltip>
  ) : (
    avatarNode
  );

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
  showTooltip: PropTypes.bool,
};

User.defaultProps = {
  avatarUrl: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
  showTooltip: false,
};

export default User;
