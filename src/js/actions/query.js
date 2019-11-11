import C from '../reducers/constants';

export default function toggleTab(id) {
  return (dispatch, getState) => {
    const status = getState().query.getIn(['tabs', id]);
    dispatch({
      type: C.QUERY_TYPE_TAB_TOGGLE,
      id,
      status: !status
    });
  }
}
