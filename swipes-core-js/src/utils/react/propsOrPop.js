export default function (ctx, ...propNames) {
  let hasPopped = false;
  const currCWM = ctx.componentWillMount;
  const currCWRP = ctx.componentWillReceiveProps;
  const currRender = ctx.render;

  const checkProps = (pop, props) => {
    const propsToCheck = props || ctx.props;
    const missing = propNames.find(key => !propsToCheck[key]);
    if (missing && typeof ctx.props.navPop === 'function') {
      if (pop && !hasPopped) {
        ctx.props.navPop();
        hasPopped = true;
      }
      return false;
    }
    return true;
  };
  ctx.componentWillMount = () => {
    if (checkProps(true) && currCWM) {
      currCWM.bind(ctx)();
    }
  };
  ctx.componentWillReceiveProps = (nextProps) => {
    if (checkProps(true, nextProps) && currCWRP) {
      currCWRP.bind(ctx)(nextProps);
    }
  };
  ctx.render = () => {
    if (!checkProps()) {
      return null;
    }
    return currRender.bind(ctx)();
  };
}
