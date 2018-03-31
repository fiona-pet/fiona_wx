import './PageActions.scss';

import React from 'react';
import classnames from 'classnames';

class PageActions extends React.Component {
  render() {
    let { className, children } = this.props;
    return (
      <div className={classnames('page-actions', className)}>{children}</div>
    );
  }
}

export default PageActions;
