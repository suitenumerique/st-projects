import { Input as SemanticUIInput } from '../../../migration-helpers';

import InputMask from './InputMask';

export default class Input extends SemanticUIInput {
  static Mask = InputMask;

  focus = (options) => this.inputRef.current.focus(options);

  blur = () => this.inputRef.current.blur();
}
