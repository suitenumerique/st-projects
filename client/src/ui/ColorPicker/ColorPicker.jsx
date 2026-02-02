import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React from 'react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
// import { useTranslation } from 'react-i18next';

import { Button } from '@openfun/cunningham-react';

import globalStyles from '../../assets/styles/styles.module.scss';
import styles from './ColorPicker.module.scss';

const ColorPicker = React.memo(({ current, onChange, colors, allowDeletion }) => {
  // const { t } = useTranslation();
  return (
    <>
      <div className={styles.colorButtons}>
        {colors.map((color) => (
          <Button
            key={color}
            type="button"
            name="color"
            variant="primary"
            value={color}
            className={classNames(
              styles.colorButton,
              color === current && styles.colorButtonActive,
              globalStyles[`background${upperFirst(camelCase(color))}`],
            )}
            onClick={onChange}
            icon={color === current && <Icon name="check" />}
          />
        ))}
      </div>
      {current && allowDeletion && (
        <Button color="brand" variant="tertiary" onClick={onChange}>
          Retirer la couleur
        </Button>
      )}
    </>
  );
});

ColorPicker.propTypes = {
  current: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func,
  allowDeletion: PropTypes.bool,
};

ColorPicker.defaultProps = {
  current: undefined,
  onChange: undefined,
  allowDeletion: false,
};

export default ColorPicker;
