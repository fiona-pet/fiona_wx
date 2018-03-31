import React from 'react';
import classnames from 'classnames';

class PageAction extends React.Component {
  static propTypes = {
    onClick: React.PropTypes.func,
  };

  render() {
    let { type, className, children, ...other } = this.props;
    let classNames = classnames(className, { primary: type === 'primary' });
    return (
      <a href="javascript:;" className={classNames} {...other}>
        {children}
      </a>
    );
  }
}

export default PageAction;
