/**
 * @date : 2016/9/22.
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import iScroll  from './iscroll';
import $ from 'n-zepto';

import './ScrollList.scss';

export  default class ScrollList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hideHelper: !this.props.hideHelper,
      containerClass: this.props.containerClass || 'wrapper',
      innerClass: this.props.innerClass || '',
      upClass: this.props.upClass || 'pullUp',
      downClass: this.props.downClass || 'pullDown',
      upContent: this.props.upContent || '上拉加载更多...',
      downContent: this.props.downContent || '下拉刷新',
      releaseContent: this.props.releaseContent || '释放立即刷新',
      downIcon: this.props.downIcon || 'icon-down',
      upIcon: this.props.upIcon || 'icon-up',
      up: this.props.onUp || function () {
      },
      down: this.props.onDown || function () {
      }
    }
  }

  componentDidMount() {
    setTimeout(()=> {
      this.loadIScroll();
    }, 300);

  }

  componentDidUpdate() {
    this.iscroll && this.iscroll.refresh();
  }

  componentUnMount() {
    this.destoryIscroll();
  }

  callbackProxy(method) {
    if (method === 'up') {
      this.state.up.call(this);
    } else if (method === 'down') {
      this.state.down.call(this);
    }
    setTimeout(()=> {
      this.iscroll.refresh()
    }, 500)
  }

  prevent(e) {
    e.preventDefault();
  }

  loadIScroll() {
    if (this.refs.scroller) {
        this.refs.scroller.addEventListener('touchmove', this.prevent.bind(this), false);
    }

    let options;
    if (!this.state.hideHelper) {
      options = {
        onBeforeScrollStart(e){
          $('input, textarea, button, a, select').off('touchstart mousedown').on('touchstart mousedown', function (e) {
            e.stopPropagation();
          });
        },
      };
    } else {
      let downElement = this.refs.down;
      let $down = $(downElement);
      // let downOffset = downElement.offsetHeight;
      let upElement = this.refs.up;
      let $up = $(upElement);
      // let upOffset = upElement.offsetHeight;
      let listView = this;
      let shouldRenderDown = ()=> {
        return this.refs.innerView.offsetHeight > this.refs.scrollView.offsetHeight;
      }
      options = {
        // topOffset: downOffset,
        useTransition: true,
        onBeforeScrollStart(e){
          $('input, textarea, button, a, select').off('touchstart mousedown').on('touchstart mousedown', function (e) {
            e.stopPropagation();
          });
        },
        onRefresh() {
          if ($down.hasClass('load')) {
            $down.removeClass('load').children('[data-content=down]').html('下拉刷新...');
          } else if ($up.has('load')) {
            $up.removeClass('load').children('[data-content=up]').html('上拉加载更多...');
          }
        },
        onScrollMove(){
          setTimeout(()=> {
            if (this.y > 5 && !$down.hasClass('flip')) {
              $down.addClass('flip')
              $down.children('[data-content=down]').html(listView.state.releaseContent);
              this.minScrollY = 0;
            } else if (this.y < (this.maxScrollY - 5) && !$up.hasClass('flip')) {
              if (shouldRenderDown()) {
                $up.addClass('flip')
                $up.children('[data-content=up]').html(listView.state.releaseContent);
              }
            }
          }, 50)

        },

        onScrollEnd(){
          let content = '加载中...';
          if ($down.hasClass('flip')) {
            $down.addClass('load').removeClass('flip');
            $down.children('[data-content=down]').html(content);
            listView.callbackProxy.call(listView, 'down');
          } else if ($up.hasClass('flip')) {
            $up.addClass('load').removeClass('flip');
            $up.children('[data-content=up]').html(content);
            listView.callbackProxy.call(listView, 'up');
          }

        }
      };
    }
    this.iscroll = new iScroll(this.refs.scrollView, options);
    if (this.props.onInit) {
      this.props.onInit(this.iscroll);
    }
  }

  destoryIscroll() {
    this.refs.scroller.removeEventListener('touchmove', this.prevent.bind(this), false);
    this.iscroll.destroy();
    this.iscroll = null;
  }

  render() {
    let { hideHelper } = this.state;
    return (
      <div className={classNames("wrapper", this.props.className)} ref="scrollView">
        <div className="scroller" ref="scroller">
          {hideHelper && (
            <div className={classNames(this.state.downClass)} ref="down">
              <span className={classNames(this.state.downIcon)}/>
              <span data-content="down" className="loading">{this.state.downContent}</span>
            </div>
          )}
          <div ref="innerView" className="inner-container">
            {this.props.children}
          </div>
          {hideHelper && (
            <div className={classNames(this.state.upClass)} ref="up">
              <span className={classNames(this.state.upIcon)}/>
              <span data-content="up" className="loading">{this.state.upContent}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
}
