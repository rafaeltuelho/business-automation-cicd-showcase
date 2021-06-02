import React from 'react';
import { Select, SelectOption, SelectVariant, SelectDirection, } from '@patternfly/react-core';

class SingleSelectInput extends React.Component {
  constructor(props) {
    super(props);
    this.options = [
      <SelectOption key={0} value="Choose..." isPlaceholder />,
    ];

    // init options
    if (props.selectOptions && props.selectOptions.length > 0) {
      props.selectOptions.forEach(o => {
        this.options.push(<SelectOption key={o.key} value={o.value} />);
      });
    }

    this.state = {
      isOpen: false,
      selected: null,
      isDisabled: false,
      direction: SelectDirection.down
    };

    this.onToggle = isOpen => {
      this.setState({
        isOpen
      });
    };

    this.onSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        this.setState({
          selected: selection,
          isOpen: false
        });
        console.log('option selected:', selection);
        this.props.handler();        
      }
    };

    this.clearSelection = () => {
      this.setState({
        selected: null,
        isOpen: false
      });
    };
  }

  render() {
    const { isOpen, selected, isDisabled, direction } = this.state;
    return (
      <div>
        <Select
          variant={SelectVariant.single}
          onToggle={this.onToggle}
          onSelect={this.onSelect}
          selections={selected}
          isOpen={isOpen}
          isDisabled={isDisabled}
          direction={direction}
        >
          {this.options}
        </Select>
      </div>
    );
  }
}

export default SingleSelectInput;