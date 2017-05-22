var React = require('react');
var ReactDOM = require('react-dom');
var blobToBuffer = require('blob-to-buffer');
var Configuration = require('../lib/Configuration');
var SourceBuffer = require('../lib/SourceBuffer');
var ParserFactory = require('../parsers/ParserFactory');
var FileSaver = require('file-saver');
var _ = require('underscore');

class FileInput extends React.Component {
  render() {
    return React.createElement(
      'div',
      {},
      React.createElement('div', {}, this.props.label),
      React.createElement(
        'input',
        {
          type: "file",
          onChange: this.props.onChange
        })
    );
  }
};

class FileOutput extends React.Component {
  render() {
    return React.createElement(
      'div',
      {
        className: "downloadButton",
        onClick: this.props.onClick
      },
      this.props.label
    );
  }
};

class Patcher extends React.Component {
  constructor() {
    super();
    this.state = {
      inputBuffer: null,
      inputFilename: null,
      patchBuffer: null,
      patchFilename: null,
      targetBuffer: null,
      targetFilename: null
    };
  }

  createFileInputHandler(bufferProperty, filenameProperty) {
    return (event) => {
      var file = event.target.files[0];
      blobToBuffer(file, (err, data) => {
        if (err) throw err;
        console.log("data: " + data.toString());
        var buffer = SourceBuffer(data);
        console.log("set filename to: " + file.name);
        this.setState(
          _.extend(
            _.clone(this.state),
            _.object([[bufferProperty, buffer], [filenameProperty, file.name]])
          )
        );
      });
    };
  }

  getOutputLabel() {
    if (this.state.inputBuffer && this.state.patchBuffer) {
      return "Patch and Save";
    } else if (this.state.inputBuffer) {
      return "Waiting for patch file...";
    } else if (this.state.patchBuffer) {
      return "Waiting for input file...";
    } else {
      return "Choose files to enable output";
    }
  }

  render() {
    return React.createElement(
      'div',
      {},
      React.createElement(
        FileInput,
        {
          label: 'Input file',
          onChange: this.createFileInputHandler('inputBuffer', 'inputFilename')
        }),
      React.createElement(
        FileInput,
        {
          label: 'Patch file',
          onChange: this.createFileInputHandler('patchBuffer', 'patchFilename')
        }),
      React.createElement(
        FileOutput,
        {
          label: this.getOutputLabel(),
          onClick: () => {
            var config = Configuration.fromObject({
              mode: 'apply',
              type: 'auto',
              file: this.state.inputFilename,
              patch: this.state.patchFilename
            });
            var targetBuffer = SourceBuffer();
            var parserFactory = ParserFactory(
              this.state.inputBuffer,
              this.state.patchBuffer,
              targetBuffer,
              config
            );

            parserFactory.getParser().applyAllPatches();
            var outputFilename = config.suggestFilename();
            this.setState(
              _.extend(
                _.clone(this.state),
                { targetBuffer: targetBuffer}
              )
            );

            var dataView = new DataView(targetBuffer.toArrayBuffer());
            FileSaver.saveAs(new Blob([dataView]), 'foo.txt');
          }
        })
    );
  }
};

ReactDOM.render(React.createElement(Patcher), document.getElementById('applique'));
