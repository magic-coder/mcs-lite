/* global window */
/* eslint react/no-find-dom-node: 0 */
// @flow
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { withTheme } from 'styled-components';
import List from 'react-virtualized/dist/commonjs/List/index';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer/index';
import ClickOutside from 'react-overlay-pack/lib/ClickOutside/index';
import Transition from 'react-overlay-pack/lib/Transition/index';
import IconFold from 'mcs-lite-icon/lib/IconFold';
import rafThrottle from 'raf-throttle';
import Input from '../Input';
import Rotate from '../Rotate';
import MenuItem from '../Menu/MenuItem';
import { StyledButton } from '../Select/styled-components';
import {
  StyledMenu,
  StyledInputGroup,
  NoRowWrapper,
  FakeInputValue,
  TextOverflow,
} from './styled-components';
import { type Value, type ItemProps, type ItemValueMapper } from './type.flow';
import {
  filterBy,
  getInputValue,
  getPlaceholder,
  getMenuItemHeight,
  getMenuHeight,
} from './utils';

type Props = {
  value: Value,
  onChange: (value: Value) => Promise<void> | void,
  items: Array<ItemProps>,
  kind?: string,
  placeholder?: string,
  focus?: boolean,
  noRowsRenderer?: ({ onClose: () => void }) => React.Node,
  disableFilter?: boolean,
  itemValueMapper?: ItemValueMapper,
  // Note: innerRef for the problem of outside click in dialog
  menuRef?: (ref: React.ElementRef<typeof StyledMenu>) => void,
};

const defaultItemValueMapper = (item: ItemProps) => item.children;

class PureInputSelect extends React.Component<
  Props & { theme: Object },
  {
    isOpen: boolean,
    filter: string,
    menuWidth: number,
  },
> {
  static defaultProps = {
    kind: 'primary',
    noRowsRenderer: () => <NoRowWrapper>No results found</NoRowWrapper>,
    disableFilter: false,
    itemValueMapper: defaultItemValueMapper,
  };
  state = { isOpen: false, filter: '', menuWidth: 0 };
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    if (this.resize && this.resize.cancel) this.resize.cancel();
  }
  onOpen = () => this.setState(() => ({ isOpen: true }));
  onClose = () => this.setState(() => ({ isOpen: false }));
  onClickOutside = (e: any) => {
    const node = findDOMNode(this.input);
    if (node && node.contains(e.target)) return; // Note: Omit input target.
    this.onClose();
  };
  onToggle = (e: any) => {
    e.preventDefault();
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
  };
  onFilterChange = (e: any) => {
    const { value } = e.target;
    this.setState(() => ({ filter: value }));
  };
  onInputGroupRef = (instance: React.ElementRef<typeof StyledInputGroup>) => {
    // Note: for dropdown width
    this.inputGroup = instance;
  };
  onInputRef = (instance: React.ElementRef<typeof Input>) => {
    // Note: for click outside
    this.input = instance;
  };
  resize = rafThrottle(() => {
    const { inputGroup } = this;
    const menuWidth =
      inputGroup &&
      inputGroup.getBoundingClientRect &&
      inputGroup.getBoundingClientRect().width;

    this.setState(() => ({ menuWidth: parseInt(menuWidth, 10) }));
  });
  rowRenderer = ({
    key,
    index,
    style,
  }: {
    key: string,
    index: number,
    style: Object,
  }): React.Element<typeof MenuItem> => {
    const {
      items,
      value,
      onChange,
      itemValueMapper = defaultItemValueMapper,
    } = this.props;
    const { filter } = this.state;
    const { onClose } = this;
    const filteredItems = filterBy({ items, filter, itemValueMapper });
    const item = filteredItems[index];
    const onItemClick = () => {
      onChange(item.value);
      this.setState(() => ({ filter: '' }));
      onClose();
    };

    return (
      <MenuItem
        key={key}
        style={style}
        active={item.value === value}
        onClick={onItemClick}
        title={itemValueMapper(item)}
      >
        <TextOverflow>{item.children}</TextOverflow>
      </MenuItem>
    );
  };
  input: ?React.ElementRef<typeof Input>;
  inputGroup: ?React.ElementRef<typeof StyledInputGroup>;
  render() {
    const {
      items,
      kind,
      placeholder,
      theme,
      value,
      noRowsRenderer,
      focus,
      menuRef,
      disableFilter,
      itemValueMapper = defaultItemValueMapper,
      ...otherProps
    } = this.props;
    const { menuWidth, isOpen, filter } = this.state;
    const {
      onInputGroupRef,
      onOpen,
      onClose,
      onToggle,
      onFilterChange,
      rowRenderer,
      onInputRef,
      onClickOutside,
    } = this;

    const filteredItems = filterBy({ items, filter, itemValueMapper });
    const activeIndex = R.findIndex(R.propEq('value', value))(items);
    const activeItem = items[activeIndex];
    const menuItemHeight = getMenuItemHeight(theme);
    const menuHeight = getMenuHeight({ filteredItems, menuItemHeight });

    return (
      <div>
        {/* Input filter */}
        <StyledInputGroup
          innerRef={onInputGroupRef}
          disableFilter={disableFilter}
        >
          <Input
            ref={onInputRef}
            kind={kind}
            focus={focus || isOpen}
            value={getInputValue({
              isOpen,
              filter,
              activeItem,
              itemValueMapper,
            })}
            onChange={onFilterChange}
            placeholder={getPlaceholder({ isOpen, activeItem, placeholder })}
            readOnly={disableFilter}
            onClick={onOpen}
            onFocus={onOpen}
            autoComplete="off"
            {...R.omit(['onChange'])(otherProps)}
          />
          {isOpen &&
            activeItem &&
            !filter && (
              <FakeInputValue defaultValue={itemValueMapper(activeItem)} />
            )}
          <StyledButton
            kind={kind}
            active={focus || isOpen}
            square
            onClick={onToggle}
          >
            <Rotate active={focus || isOpen}>
              <IconFold />
            </Rotate>
          </StyledButton>
        </StyledInputGroup>

        {/* Dropdown overlay */}
        {isOpen && (
          <ClickOutside onClick={onClickOutside}>
            <Transition
              style={{ transform: 'translateY(0px)' }} // From
              animation={{ translateY: 5, ease: 'easeOutQuart', duration: 350 }} // To
              component={false}
            >
              <StyledMenu key="menu" innerRef={menuRef} width={menuWidth}>
                {R.isEmpty(filteredItems) &&
                  noRowsRenderer &&
                  noRowsRenderer({ onClose })}
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      height={menuHeight}
                      rowCount={filteredItems.length}
                      rowHeight={menuItemHeight}
                      rowRenderer={rowRenderer}
                      scrollToIndex={activeIndex}
                    />
                  )}
                </AutoSizer>
              </StyledMenu>
            </Transition>
          </ClickOutside>
        )}
      </div>
    );
  }
}

const InputSelect: React.ComponentType<Props> = withTheme(PureInputSelect);
InputSelect.displayName = 'InputSelect';
InputSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onChange: PropTypes.func.isRequired, // (value: Value) => Promise<void> | void,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      children: PropTypes.node.isRequired,
    }),
  ).isRequired,
  kind: PropTypes.string,
  placeholder: PropTypes.string,
  noRowsRenderer: PropTypes.func,
  focus: PropTypes.bool,
  disableFilter: PropTypes.bool,
  itemValueMapper: PropTypes.func,
  menuRef: PropTypes.func,
};

export default InputSelect;
