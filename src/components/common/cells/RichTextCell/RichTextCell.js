import React from 'react'
import PropTypes from 'prop-types'
import './RichTextCell.scss'
import {
    Cell,
    CellHeader
} from 'react-weui';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const Delta = Quill.import('delta');

class RichTextCell extends React.Component {
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
      return <div className="RichTextCell">
          <Cell>
              <CellHeader>
                  <div className="cell_body_head">
                      <span className="isRequire">{props.required ? "*":" "}</span>
                  </div>
                  <div  className="cell_body_content">
                      {props.title}
                  </div>
              </CellHeader>
          </Cell>
          <ReactQuill
              className={props.readonly ? 'noToolBar' : ''}
              style={{padding: '8px 12px'}}
              readOnly={props.readonly}
              defaultValue={new Delta(JSON.parse(props.defaultValue ? props.defaultValue : '{}'))}
              onChange={(value, delta, source, editor) => {
                  props.valueChange(JSON.stringify(editor.getContents()), props.id, props.name)
              }}
          >
              <div className="custom-editing-area"
                   onClick={props.readonly ? props.onClick():''}/>
          </ReactQuill>
      </div>
  }
}


RichTextCell.propTypes = {
    defaultValue: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    onClick: PropTypes.func,
    hidden: PropTypes.bool,
}


export default RichTextCell
