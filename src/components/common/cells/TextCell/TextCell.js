import React from 'react'
import PropTypes from 'prop-types'
import './TextCell.scss'
import {
    Input,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class TextCell extends React.Component {
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
      return <Cell className="TextCell">
          <CellHeader>
              <div className="cell_body_head">
                  <span className="isRequire">{props.required ? "*":" "}</span>
              </div>
              <div  className="cell_body_content">
                  {props.title}
              </div>
          </CellHeader>
          <CellBody>
              {props.readonly ? props.defaultValue :
                  <Input placeholder={props.placeholder ? props.placeholder : "在此填写"}
                         type="text"
                         key={props.title}
                         defaultValue={props.defaultValue}
                         onBlur={(e) => {
                             props.valueChange(e.target.value, props.id, props.name)
                         }
                         }>
                  </Input>
              }
          </CellBody>
          <CellFooter>
          </CellFooter>
      </Cell>
  }
}


TextCell.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
    valueChange: PropTypes.func,
}


export default TextCell
