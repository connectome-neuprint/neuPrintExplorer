import React from 'react';
import { render, screen } from '../../tests/test-utils';
// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';
import TablePaginationActions from './TablePaginationActions';

function doNothing() {}

describe('TablePaginationActions', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={0} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('TablePaginationActions shows next link disabled', async () => {
    await render(
      <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={10} />
    );

    const buttons = await screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled(); // First page button
    expect(buttons[3]).toBeDisabled(); // Last page button
  });

  test('TablePaginationActions shows prev link disabled', async () => {

    await render(
      <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={0} />
    );

    const buttons = await screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled(); // First page button
    expect(buttons[3]).not.toBeDisabled(); // Last page button
  });

});
/*
test('TablePaginationActions shows alternate icons for rtl theme', () => {
  const theme = {
    direction: 'rtl',
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
  const raw = (
    <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={0} />
  );
  const wrapper = mount(raw);
  wrapper.find('button').at(3).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(9);
});

test('clicking on first page link sends user to last page', () => {
  const onPageChange = sinon.spy();
  const raw = (
    <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={5} />
  );
  const wrapper = mount(raw);
  wrapper.find('button').at(0).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(0);
});

test('clicking on next page link sends user to next page', () => {
  const page = 4;
  const onPageChange = sinon.spy();
  const raw = (
    <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={page} />
  );
  const wrapper = mount(raw);
  wrapper.find('button').at(2).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(page + 1);
});

test('clicking on prev page link sends user to prev page', () => {
  const page = 4;
  const onPageChange = sinon.spy();
  const raw = (
    <TablePaginationActions count={50} onPageChange={onPageChange} rowsPerPage={5} page={page} />
  );
  const wrapper = mount(raw);
  wrapper.find('button').at(1).simulate('click');
  expect(onPageChange.calledOnce).toBe(true);
  expect(onPageChange.args[0][1]).toEqual(page - 1);
});
*/
