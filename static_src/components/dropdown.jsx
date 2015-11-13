
import React from 'react';

import classNames from 'classnames';

export default class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = { open: false };
  }

  handleTitleClick = (ev) => {
    this.setState({ open: !this.state.open });
  }

  render() {
    var id = 'dropdown-' + this.props.title,
        classes = classNames('dropdown', this.props.classes, {
          'open': !!this.state.open
        });

    return (
      <div className={ classes }>
      <a id="dropdown-{ this.props.title }" 
            className="dropdown-toggle" role="button"
            aria-haspopup="true" aria-expanded={ id }
            onClick={ this.handleTitleClick }>
          { this.props.title }
          <span className="caret"></span>
        </a>
        <ul className="dropdown-menu" 
            aria-labelledby={ id }>
          { this.props.items.map((item) => {
            return (
              <li key={ item.key }>{ item.element }</li>
            )
          })}
        </ul>
      </div>
    );
  }
};

Dropdown.propTypes = { 
  title: React.PropTypes.string.isRequired,
  items: React.PropTypes.any,
  classes: React.PropTypes.array
};
