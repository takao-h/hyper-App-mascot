exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    cursorColor: 'red',
    css: `
      ${config.css || ''}
      // 吹き出しを揺らすアニメーション (https://q-az.net/buruburu-hurueru-css/)
        @keyframes shakeshake {
            0% {transform: translate(0px, 0px) rotateZ(0deg)}
            25% {transform: translate(2px, 2px) rotateZ(1deg)}
            50% {transform: translate(0px, 2px) rotateZ(0deg)}
            75% {transform: translate(2px, 0px) rotateZ(-1deg)}
            100% {transform: translate(0px, 0px) rotateZ(0deg)}
        }
        .shake {
            animation: shakeshake .1s  infinite;
        }
      // 吹き出し (https://saruwakakun.com/html-css/reference/speech-bubble)
        .balloon {
            position: relative;
            display: inline-block;
            margin: 1.5em 0;
            padding: 7px 10px;
            min-width: 120px;
            max-width: 100%;
            color: #555;
            font-size: 16px;
            background: #e0edff;
            border-radius: 15px;
        }
        .balloon:before{
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -15px;
            border: 15px solid transparent;
            border-top: 15px solid #e0edff;
        }
        .balloon p {
            margin: 0;
            padding: 0;
            font-family: 'arial unicode ms';
        }
    `
  });
}

// キャラクター表示
 exports.decorateTerm = (Term, {React, notify}) => {
   return class extends React.Component {
     render() {
      const children =[
        React.createElement("image", {src: "./pic/d3657524.jpg"}),
        React.createElement(Term, this.props),
      ];
      return React.createElement("div", null, children);
     }
   }
 }

 //アクションを検知する
 exports.middleware = state => next => (action) => {
     if(action.type === 'SESSION_ADD_DATA') {
       if(/.*: .* No such file or directory/.test(action.data)) {
        store.dispatch({
          type: 'CHANGE_MASCOT_FEEL',
          skin: 'angry',
          speech: 'んなファイルはねーよ。バーーカ',
        });
       }
     }
     next(action);
 }

 exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'CHANGE_MASCOT_FEEL':
      const {skin, speech} = action;
      return state.set('mascotState', {skin, speech});
    default:
      return state;
  }
 };


 //stateをTermコンポーネントのpropsにマップ
 exports.mapTermsState = (state, map) => Object.assign(map, {mascotState: state.ui.mascotState,});

 //親から子へpropsを受け渡す
 const passProps = (uid, parentProps, props) => Object.assign(props, {mascotState: parentProps.mascotState,});

 exports.getTermGroupProps = passProps;
 exports.getTermProps = passProps;

 exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
      constructor(props, context) {
          super(props, context);
          this.skins = {
              normal: React.createElement("img", {src: "/path/retsuko_normal.png", onClick: ()=>{}}),
              angry: React.createElement("img", {src: "/path/retsuko_angry.png", onClick: ()=>{}}),
              raged: React.createElement("img", {src: "/path/retsuko_raged.gif", onClick: ()=>{}})
          }
      }

      render () {
          const {skin, speech} = this.props.mascotState ? this.props.mascotState :
              { skin: 'normal', speech: '・・・'};

          const skinComponent = this.skins[skin];
          const classNames = skin == 'normal' ? 'balloon' : 'balloon shake';

          const children = [
              React.createElement("div", {style: styles.img},
                  React.createElement("div", {style: styles.baloon, class: classNames},
                       React.createElement("p", {}, speech)), skinComponent,
              ),
              React.createElement(Term, Object.assign({}, this.props, {style: {backgroundColor: 'rgba(25,64,25,0.5)'}})),
          ];

          return React.createElement("div", {style: { width: '100%', height: '100%', position: 'relative' }}, children);
      }
  };
}
