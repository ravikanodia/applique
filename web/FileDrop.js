// The web part of applique is kind of an excuse for me to learn the React
// framework. The smart/easy thing to do would be to use the react-file-drop
// npm module. Instead, I decided to write my own file drop utility, based on
// the interface provided by react-file-drop.
//
//
var _ = require('underscore');
var React = require('react');


// props:
// onDrop - function(files, event)
//   * callback when the user drops files onto the target
// onDragOver - function(event)
//   * callback function for when the user is dragging over the target.
//   * independently, the class "file-drop-dragging-over-target" will be added
//     to the file drop target.
// onDragLeave - function(event)
//   * callback function for when the user leaves the target
//   * Also removes the "file-drop-dragging-over-target" class.
// dropEfect - String: "copy" || "move" || "link" || "none" (default: "copy")
//   * I have no idea what this means.
// targetAlwaysVisisble: Boolean (default: false)
//   * If true, the file drop target is always visible (otherwise, it's only
//     visible when the user is dragging over the frame
// frame: document || window || HTMLElement (default: document)
//   * Dragging files over the frame is what makes the magic start.
// onFrameDragEnter - function(event)
//   * callback for when the user begins dragging over the frame
// onFrameDragLeave - function(event)
//   * callback when the user stops dragging over the frame
// onFrameDrop - function(event)
//   * callback when the user drops files _anywhere_ over the frame
class FileDrop extends React.Component {

  getDefaultProps() {
    // Make functions default to a no-op. That way, we don't have to check them
    // for undefined at callback time.
    function noop() {}
    return {
      onFrameDragEnter: noop,
      onFrameDragLeave: noop,
      onFrameDrop: noop,
      onDragOver: noop,
      onDragLeave: noop,
      onDrop: noop
    };
  }

  render() {
    var frame = this.props.frame || document;
    var frameListeners = {
      dragover: this.props.onFrameDragEnter,
      dragleave: this.props.onFrameDragLeave,
      drop: this.props.onFrameDrop
    };
    _.each(frameListeners,
      (listener, eventType) => frame.addEventListener(eventType, listener));

    var handleDrop = (event) => {
      event.preventDefault();
      this.props.onDrop(event)
    };

    var handleDragOver = event => {
      event.preventDefault();
      event.stopPropagation();
      // dropEffect?
      //
      this.props.onDragOver(event);
    };

    var handleDragLeave = event => {
      event.preventDefault(); // Are these necessary?
      event.stopPropagation();
      this.props.onDragLeave(event);
    };

    return React.createElement(
      'div',
      {
        className: "file-drop-target",
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave
      }
    );
  }


};

// Set callbacks to a no-op by default. That way, we don't have to guard
// against undefined callbacks at the time of invocation.
function noop() {}

FileDrop.defaultProps = {
  onFrameDragEnter: noop,
  onFrameDragLeave: noop,
  onFrameDrop: noop,
  onDragOver: noop,
  onDragLeave: noop,
  onDrop: noop
};


module.exports = FileDrop;
