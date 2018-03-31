import React from 'react'
import PropTypes from 'prop-types'
import './LabelCell.scss'
import {
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class LableCell extends React.Component {
  constructor(props) {
      super(props)
  }


  componentDidMount() {


  }


  render() {
      const props = this.props;
      if (props.hidden){
          return <div></div>
      }
      return <Cell>
          <CellHeader>
              <div className="cell_body_head">
                  <span className="isRequire">{props.required ? "*":" "}</span>
              </div>
              <div  className="cell_body_content">
                  {props.title}
              </div>
          </CellHeader>
          <CellBody>
              {props.defaultValue}
          </CellBody>
          <CellFooter>
          </CellFooter>
      </Cell>
  }
}


LableCell.propTypes = {
    defaultValue: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
}


export default LableCell
