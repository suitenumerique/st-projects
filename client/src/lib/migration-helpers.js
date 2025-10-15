// Migration helpers for semantic-ui-react to Cunningham React
// This file provides compatibility wrappers and migration utilities

import React from 'react';
import PropTypes from 'prop-types';

// Button migration helper - using basic button for now
function Button(props) {
  const { children, onClick, disabled, loading, primary, secondary, size, type } = props;

  const className =
    `ui button ${primary ? 'primary' : ''} ${secondary ? 'secondary' : ''} ${disabled || loading ? 'disabled' : ''} ${size || ''}`.trim();

  return (
    <button
      /* eslint-disable-next-line react/button-has-type */
      type={type || 'button'}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  // basic: PropTypes.bool,
  size: PropTypes.string,
  // icon: PropTypes.node,
  type: PropTypes.string,
};

Button.defaultProps = {
  children: null,
  onClick: null,
  disabled: false,
  loading: false,
  primary: false,
  secondary: false,
  // basic: false,
  size: 'medium',
  // icon: null,
  type: 'button',
};

// Input migration helper - using basic input for now
function Input(props) {
  const { label, error, id, name, type, value, placeholder, onChange, onBlur, onFocus } = props;
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui input">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={error ? 'error' : ''}
      />
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

Input.defaultProps = {
  label: '',
  error: false,
  id: null,
  name: null,
  type: 'text',
  value: null,
  placeholder: null,
  onChange: null,
  onBlur: null,
  onFocus: null,
};

// TextArea migration helper - using basic textarea for now
const TextArea = React.forwardRef((props, ref) => {
  const { label, error, id, name, value, placeholder, onChange, onBlur, onFocus } = props;
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui input">
      {label && <label htmlFor={textareaId}>{label}</label>}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={error ? 'error' : ''}
      />
    </div>
  );
});

TextArea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

TextArea.defaultProps = {
  label: '',
  error: false,
  id: null,
  name: null,
  value: null,
  placeholder: null,
  onChange: null,
  onBlur: null,
  onFocus: null,
};

// Modal migration helper - using basic div for now
function Modal(props) {
  const { open, children } = props;

  if (!open) return null;

  return (
    <div className="ui modal active">
      <div className="content">{children}</div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  // onClose: PropTypes.func,
  children: PropTypes.node,
};

Modal.defaultProps = {
  open: false,
  // onClose: null,
  children: null,
};

// Checkbox migration helper - using basic input for now
function Checkbox(props) {
  const { label, checked, onChange, id, name, value } = props;
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui checkbox">
      <input
        id={checkboxId}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label && <label htmlFor={checkboxId}>{label}</label>}
    </div>
  );
}

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
};

Checkbox.defaultProps = {
  label: '',
  checked: false,
  onChange: null,
  id: null,
  name: null,
  value: null,
};

// Radio migration helper - using basic input for now
function Radio(props) {
  const { label, checked, onChange, id, name, value } = props;
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui radio checkbox">
      <input
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label && <label htmlFor={radioId}>{label}</label>}
    </div>
  );
}

Radio.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
};

Radio.defaultProps = {
  label: '',
  checked: false,
  onChange: null,
  id: null,
  name: null,
  value: null,
};

// Loader migration helper - using basic div for now
function Loader(props) {
  const { active } = props;

  if (!active) return null;

  return <div className="ui active loader" />;
}

Loader.propTypes = {
  active: PropTypes.bool,
  // size: PropTypes.string,
};

Loader.defaultProps = {
  active: false,
  // size: 'medium',
};

// Progress migration helper - using basic div for now
function Progress() {
  return <div className="ui progress" />;
}

// Icon migration helper - using Font Awesome
function Icon(props) {
  const { name } = props;

  return <i className={`fa fa-${name}`} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

// Form migration helper - using basic div
function Form(props) {
  const { children } = props;

  return <div className="ui form">{children}</div>;
}

Form.propTypes = {
  children: PropTypes.node,
};

Form.defaultProps = {
  children: null,
};

// Grid migration helper - using basic div
function Grid(props) {
  const { children } = props;

  return <div className="ui grid">{children}</div>;
}

Grid.propTypes = {
  children: PropTypes.node,
};

Grid.defaultProps = {
  children: null,
};

// Container migration helper
function Container(props) {
  const { children } = props;

  return <div className="ui container">{children}</div>;
}

Container.propTypes = {
  children: PropTypes.node,
};

Container.defaultProps = {
  children: null,
};

// Header migration helper
function Header(props) {
  const { children } = props;

  return <h1 className="ui header">{children}</h1>;
}

Header.propTypes = {
  children: PropTypes.node,
};

Header.defaultProps = {
  children: null,
};

// Message migration helper
function Message(props) {
  const { children, error, success, warning } = props;

  let className = 'ui message';
  if (error) className += ' error';
  if (success) className += ' success';
  if (warning) className += ' warning';

  return <div className={className}>{children}</div>;
}

Message.propTypes = {
  children: PropTypes.node,
  error: PropTypes.bool,
  success: PropTypes.bool,
  warning: PropTypes.bool,
};

Message.defaultProps = {
  children: null,
  error: false,
  success: false,
  warning: false,
};

// Menu migration helper
function Menu(props) {
  const { children } = props;

  return <div className="ui menu">{children}</div>;
}

Menu.propTypes = {
  children: PropTypes.node,
};

Menu.defaultProps = {
  children: null,
};

// Segment migration helper
function Segment(props) {
  const { children } = props;

  return <div className="ui segment">{children}</div>;
}

Segment.propTypes = {
  children: PropTypes.node,
};

Segment.defaultProps = {
  children: null,
};

// Table migration helper
function Table(props) {
  const { children } = props;

  return <table className="ui table">{children}</table>;
}

Table.propTypes = {
  children: PropTypes.node,
};

Table.defaultProps = {
  children: null,
};

// Tab migration helper
function Tab(props) {
  const { children } = props;

  return <div className="ui tab">{children}</div>;
}

Tab.propTypes = {
  children: PropTypes.node,
};

Tab.defaultProps = {
  children: null,
};

// Divider migration helper
function Divider() {
  return <hr className="ui divider" />;
}

// Image migration helper
function Image(props) {
  const { src, alt } = props;

  return <img src={src} alt={alt || ''} className="ui image" />;
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

Image.defaultProps = {
  alt: '',
};

// Label migration helper
function Label(props) {
  const { children } = props;

  return <span className="ui label">{children}</span>;
}

Label.propTypes = {
  children: PropTypes.node,
};

Label.defaultProps = {
  children: null,
};

// Comment migration helper
function Comment(props) {
  const { children } = props;

  return <div className="ui comment">{children}</div>;
}

Comment.propTypes = {
  children: PropTypes.node,
};

Comment.defaultProps = {
  children: null,
};

// Visibility migration helper
function Visibility(props) {
  const { children } = props;

  return <div>{children}</div>;
}

Visibility.propTypes = {
  children: PropTypes.node,
};

Visibility.defaultProps = {
  children: null,
};

// Dropdown migration helper
function Dropdown(props) {
  const { children } = props;

  return <div className="ui dropdown">{children}</div>;
}

Dropdown.propTypes = {
  children: PropTypes.node,
};

Dropdown.defaultProps = {
  children: null,
};

// Popup migration helper
function Popup(props) {
  const { children } = props;

  return <div className="ui popup">{children}</div>;
}

Popup.propTypes = {
  children: PropTypes.node,
};

Popup.defaultProps = {
  children: null,
};

// Export all components
export {
  Button,
  Input,
  TextArea,
  Modal,
  Checkbox,
  Radio,
  Loader,
  Progress,
  Icon,
  Form,
  Grid,
  Container,
  Header,
  Message,
  Menu,
  Segment,
  Table,
  Tab,
  Divider,
  Image,
  Label,
  Comment,
  Visibility,
  Dropdown,
  Popup,
};
