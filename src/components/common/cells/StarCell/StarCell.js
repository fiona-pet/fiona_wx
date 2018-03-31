import React from 'react'
import PropTypes from 'prop-types'
import './StarCell.scss'
import {
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';
import FiveStars from '../../FiveStars'

class StarCell extends React.Component {
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
              <FiveStars
                  clickable={!props.readonly}
                  selectedIndex={parseInt(props.defaultValue)}
                  valueChange={index => {
                      props.valueChange(index, props.id, props.name);
                  }}
              />
          </CellBody>
          <CellFooter>
          </CellFooter>
      </Cell>
  }
}


StarCell.propTypes = {
    defaultValue: PropTypes.number,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    valueChange: PropTypes.func,
    hidden: PropTypes.bool,
}


export default StarCell
