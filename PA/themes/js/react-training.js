(function($){
  $(function(){
    /*******************/
    $('#main').append('<div id="content1"></div>');
    React.render(
      <h1>Hello Baby</h1>,
      document.getElementById('content1')
    );
    /*******************/
    $('#main').append('<div id="content2"></div>');
    var names=['Doris','Olivia','Leon','Mike','Ken','Marshall'];
    React.render(
      <div>
      {
        names.map(function(n){
          return <div>Hello {n}!</div>
        })
      }
      </div>,
      document.getElementById('content2')
    );
    /*******************/
    $('#main').append('<div id="content3"></div>');
    var arr=[<li>value 1 from array</li>,<li>value 2 from array</li>];
    React.render(
      <ul>{arr}</ul>,
      document.getElementById('content3')
    );
    /*******************/
    $('#main').append('<div id="content4"></div>');
    var HelloMessage=React.createClass({
      render:function(){
        var msg="Good morning";
        if((new Date()).getHours()>=12)
          msg='Good afternoon';
        return <h3>{msg} {this.props.name} !</h3>;
      }
    });
    React.render(
      <HelloMessage name="Doris"/>,
      document.getElementById('content4')
    );
    /*******************/
    $('#main').append('<div id="content5"></div>');
    var NotesList=React.createClass({
      render:function(){
        return (
          <ol>
          {
            this.props.children.map(function(child){
              return <li>{child}</li>
            })
          }
          </ol>
        );
      }
    });
    React.render(
      <NotesList>
        <span>note 1: blablabla...</span>
        <span>note 2: blablabla...</span>
      </NotesList>,
      document.getElementById('content5')
    );
    /*******************/
    $('#main').append('<div id="content6"></div>');
    var MyComponent=React.createClass({
      getInitialState:function(){
        return {value:''};
      },
      handleClick:function(){
        React.findDOMNode(this.refs.myTextInput).value='';
        React.findDOMNode(this.refs.myTextInput).focus();
        this.setState({value:''});
      },
      handleChange:function(e){
        this.setState({value:e.target.value});
      },
      render:function(){
        var value=this.state.value;
        return (
          <div>
            <input type="text" ref="myTextInput" value={value} onChange={this.handleChange}/>
            <button onClick={this.handleClick}>Empty the text input</button>
            <p>{value}</p>
          </div>
        );
      }
    });
    React.render(
      <MyComponent/>,
      document.getElementById('content6')
    );
    /*******************/
    $('#main').append('<div id="content7"></div>');
    var SwitchButton=React.createClass({
      getInitialState:function(){
        return {isOn:true};
      },
      handleClick:function(e){
        this.setState({isOn:!this.state.isOn});
      },
      render:function(){
        var text=this.state.isOn?'Switch On':'Switch Off';
        return (
          <div>
            <span>{text}</span>
            <input type="button" onClick={this.handleClick} value="Click to Switch"/>
          </div>
        );
      }
    });
    React.render(
      <SwitchButton/>,
      document.getElementById('content7')
    );

  });
})(jQuery);
