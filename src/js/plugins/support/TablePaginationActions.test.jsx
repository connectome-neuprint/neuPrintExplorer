import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import TablePaginationActions from './TablePaginationActions';

Enzyme.configure({adapter: new Adapter()});

function doNothing() {}

test('TablePaginationActions shows next link disabled', () => {
  const raw = <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={10} />;
  const component = renderer.create(raw);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const wrapper = mount(raw);
  expect(wrapper.find('button').at(0).props().disabled).toBe(false);
  expect(wrapper.find('button').at(3).props().disabled).toBe(true);

});

test('TablePaginationActions shows prev link disabled', () => {
  const raw = <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={0} />;
  const component = renderer.create(raw);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const wrapper = mount(raw);
  expect(wrapper.find('button').at(0).props().disabled).toBe(true);
  expect(wrapper.find('button').at(3).props().disabled).toBe(false);
});

test('TablePaginationActions shows alternate icons for rtl theme', () => {
  const theme = {
    direction: 'rtl'
  };
  const component = renderer.create(
    <TablePaginationActions
      count={50}
      onPageChange={doNothing}
      rowsPerPage={5}
      page={1}
      theme={theme}
    />
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('clicking on last page link sends user to last page', () => {
  const onPageChange = sinon.spy();
  const raw = <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={0} />;
  const wrapper = mount(raw);
  wrapper.find('button').at(3).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(9);
});

test('clicking on first page link sends user to last page', () => {
  const onPageChange = sinon.spy();
  const raw = <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={5} />;
  const wrapper = mount(raw);
  wrapper.find('button').at(0).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(0);
});

test('clicking on next page link sends user to next page', () => {
  const page = 4
  const onPageChange = sinon.spy();
  const raw = <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={page} />;
  const wrapper = mount(raw);
  wrapper.find('button').at(2).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(page + 1);
});

test('clicking on prev page link sends user to prev page', () => {
  const page = 4
  const onPageChange = sinon.spy();
  const raw = <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={page} />;
  const wrapper = mount(raw);
  wrapper.find('button').at(1).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(page - 1);
});
